'use strict';

//@params hostname
//@returns promise
// - @promise resolved -> "community"
// - @promise rejected -> Error("community not found);
//----------------------------------------------------
//

var Promise = require('bluebird');
var snmp = require('snmp-native');
var config = require('config');
var async = require('async');
var communities = config.get('snmp.communities');
var oids = config.get('snmp.oids');

function findSnmpCommunity(hostname){
    if(typeof hostname !== 'string') throw new Error('Bad input argument, should be of type string');
    return new Promise(function(resolve, reject){
        findSnmpCommunity.sessions = [];//will contain snmp sessions so we can close them later
        async.some(
            communities,//the Array to iterate trough
            function iterator(community, callback){//when callback is called with true ifFoundOrAllSearched is called immediately

                var session = new snmp.Session({host:hostname, community: community});
                findSnmpCommunity.sessions.push(session);
                session.get({oid: oids.hostname}, function (err, vars){
                    if(err){
                        callback(err, false);
                    }
                    else if(vars){
                        findSnmpCommunity.foundCommunity = community;
                        callback(null, true);//by callinig this we jump to ifFoundOrAllSearched right away
                    }
                });
            },
            function ifFoundOrAllSearched(err, found){//found is true if callback once fired with true, else false
                    if(found){
                        resolve(findSnmpCommunity.foundCommunity);//we return community if success
                    }
                    else{
                        reject(err);
                    }
                    //we clean up sessions
                    findSnmpCommunity.sessions.forEach(function(sessionToClose){
                        sessionToClose.close();
                    });
            
            }
        );
    });
}
                       
module.exports = findSnmpCommunity;