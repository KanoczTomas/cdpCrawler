'use strict';

//@params hostname
//@returns promise
// - @promise resolved -> {hostname: hostname, community: community }
// - @promise rejected -> Error(Promise.aggregateError);
//----------------------------------------------------
//

var Promise = require('bluebird');
var snmp = Promise.promisifyAll(require('snmp-native'));
var config = require('config');
var communities = config.get('snmp.communities');
var oids = config.get('snmp.oids');


function findSnmpCommunity(hostname){
    if(typeof hostname !== 'string') throw new Error('Bad input argument, should be of type string');
    
    findSnmpCommunity.sessions = [];
    var workQueue = []; //we will push promisses here for the generator later to pick up
    
    //we itterate through all the communities, create a new snmp object and push session
    //objects to findSnmpCommunity.sessions and workQueue. WorkQueue is just an array
    //of promises (as getAsync returns a promise). We can later call Promise.any on 
    //it (see Promise.courutine below) to race the promises
    communities.forEach(function(community){
        var session = new snmp.Session({host: hostname, community: community});
        //workQueue.push(session.getAsync({oid: oids.hostname}))
        var promise = session.getAsync({oid: oids.hostname})
        .then(function(res){
            
            return {
                hostname: res[0].value,
                community: session.options.community
            };
        });
        workQueue.push(promise);
        findSnmpCommunity.sessions.push(session);  
    });
    
    var resultPromise = Promise.coroutine(function *gen(){
        var result;
        try{
            result = yield Promise.any(workQueue);
        }
        catch(err){
            result = Promise.reject(err);
        }
        
        //we clean up sessions
        findSnmpCommunity.sessions.forEach(function(sessionToClose){
            sessionToClose.close();
        });
        
        //we resolve the promise, if it is successfull, the {hostname: 'hostname',
        //community: 'community'} object will be as the filfilled value of the promise,
        //if rejected, err wil reject
        return Promise.resolve(result); 
    })();//Promise.coroutine of course returns a promise :)
    
    return resultPromise;    
}
                       
module.exports = findSnmpCommunity;