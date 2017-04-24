'use strict';

//@params hostname
//@returns promise
// - @promise resolved -> Array of CDP neighbors
// - @promise rejected -> Error("community not found);
//----------------------------------------------------
//

var Promise = require('bluebird');
var snmp = Promise.promisifyAll(require('snmp-native'));
var config = require('config');
var oids = config.get('snmp.oids');

function findCdpNeighbors(host, community){
    if(arguments.length != 2) {
        throw new Error('The function takes 2 arguments!');
    }
    if(typeof host !== 'string') {
        throw new Error('host must be a string, invalid type (' + typeof host + ')');
    }
    if(typeof community !== 'string') {
        throw new Error('community must be a string, invalid type (' + typeof community + ')');
    }
    findCdpNeighbors.cdpIndexes = [];//will hold the subtree index for each neighbor - later will be queried per neighbor for IP, hostname, port, etc.
    var workQueue = [];
    function findCdpIndexes(host, community){
        //we want to remember the session opened here as findCdpNeighbor will reuse it
        findCdpNeighbors.session = new snmp.Session({host: host, community: community});
        return findCdpNeighbors.session.getSubtreeAsync({oid: oids.cdpCacheDeviceId})
        .then(function(vars){
            vars.forEach(function(entry){
                findCdpNeighbors.cdpIndexes.push('.' + entry.oid.slice(-2).join('.'));//we take the 2 last elements of an array an convert it to a string delimited with '.'
            });
        });
    };
    function getCdpInformation(){//prepares the workqueue and defines promise when fulfilled
        findCdpNeighbors.cdpIndexes.forEach(function (cdpIndex){
            var oidsWithIndex = [
                oids.cdpCacheDeviceId + cdpIndex, 
                oids.ifDescription + '.' + cdpIndex.split(".")[1],
                oids.cdpCacheAddress + cdpIndex,
                oids.cdpCachePlatform + cdpIndex,
                oids.cdpCacheDevicePort + cdpIndex
            ];
            workQueue.push(findCdpNeighbors.session.getAllAsync({oids: oidsWithIndex})
            .then(function (varbinds){
                return Promise.resolve({
                    neighborHostname: varbinds[0].value,
                    localInterface: varbinds[1].value,
                    neighborIP: function getIP(){
                        var ip = varbinds[2].valueHex.slice(0,8);
                        ip = parseInt(ip.substr(0,2),16) + '.' + parseInt(ip.substr(2,2),16) + '.' + parseInt(ip.substr(4,2),16) + '.' + parseInt(ip.substr(6,2),16);
                        return ip;
                    }(),
                    neighborPlatform: varbinds[3].value,
                    neighborPort: varbinds[4].value
                });
            }));
        });
    }
    var resultPromise = Promise.coroutine(function *gen(){
        var result;
        try {
            var findIndexes = yield findCdpIndexes(host, community);
        }
        catch (err){
            result = Promise.reject(err);
        }
        getCdpInformation();//we populate the workQueue
        
        try {
            result = yield Promise.all(workQueue);
            //if(result.length === 0) throw new Error('We got back empty cdp neighbors, is cdp running? Perhaps not a cdp capable device?');
        }
        catch (err){
            result = Promise.reject(err);
        }
        findCdpNeighbors.session.close(); //we close the snmp session
        return result;
    })();
    return resultPromise;
}

module.exports = findCdpNeighbors;