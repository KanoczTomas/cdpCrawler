'use strict';

//@params hostname
//@returns promise
// - @promise resolved -> returns graph object
// - @promise rejected -> Proper error propagated
//----------------------------------------------------


var Promise = require('bluebird');
var config = require('config');
var oids = config.get('snmp.oids');
var hostToIp = require('host-to-ip');
var Promiseq = require('promiseq');
var findSnmpCommunity = require('./modules/findSnmpCommunity');
var findCdpNeighbors = require('./modules/findCdpNeighbors');
var Graph = require('graph-data-structure');

function cdpCrawl(hostname){
    var cdpCrawl.queue = new Promiseq();
    var cdpCrawl.listOfDecivesCrawled = [];    //structure list of objects with {hostname}
    var cdpCrawl.graph = Graph();
    var root; //the root node info will be held here
    
    
    function addToqueue(hostname){
        //will hate to check if the nostname is in list of devices crawled, 
        //if it is not will call cdpCrawl.queue.push()
        //the then after push must include the hostname in the list of crawled devices
    }
    
    //this should be a generic function for all jobs included to the queue, resolving to a promise which once filled goes to list of devices crawled
    return Promise.coroutine(function *gen(){
        var result;
        
        try{
            root = yield findSnmpCommunity(hostname);
        }
        catch(err){
            result = Promise.reject(err);
        }
        
        try{
            root.cdpInfo = yield findCdpNeighbors(root.hostname, root.community)
        }
        
        //nezabudn pridat root hostname do list of devices crawled
        
        
        return Promise.resolve(result);
        
        
    })();
}


