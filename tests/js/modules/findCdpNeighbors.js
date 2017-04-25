'use strict';

var proxyquire = require('proxyquire');
var should = require('should');
var sinon = require('sinon');

var hasCDP, snmpErrorGetSubtree;

proxyquire('../../../js/modules/findCdpNeighbors',{
    'snmp-native': {
        Session: function Session(sessionConfigObj){
            var self = this;//we remember the Session object to later
            //assign options object to it
            this.getSubtreeAsync = function sessionGetSubtreeAsync(){
                if(!hasCDP) return Promise.resolve([]);
                if(snmpErrorGetSubtree) return Promise.reject(new Error('findCdpIndexes failed badly - muhaha!'));
                return Promise.resolve([ 
                    {
                        oid: [ 1, 3, 6, 1, 4, 1, 9, 9, 23, 1, 2, 1, 1, 6, 2, 5 ],
                    },
                    {
                        oid: [ 1, 3, 6, 1, 4, 1, 9, 9, 23, 1, 2, 1, 1, 6, 3, 4 ],
                    },
                    {
                        oid: [ 1, 3, 6, 1, 4, 1, 9, 9, 23, 1, 2, 1, 1, 6, 4, 2 ],
                    }
                ]);
            };
            this.getAllAsync = function sessionGetAllAsync(oids){
                var oid = '.' + oids.oids[0].split('.').slice(-2).join('.');//we get the last 2 oids parts, but it is a string, must convert to array to do slice
                var result;
                switch(oid){
                    case '.2.5':
                        result = [
                            {
                                value: 'some25.hostname.com',
                            },
                            {
                                value: 'GigabitEthernet2/3/25',
                            },
                            {
                                valueHex: '19191919'
                            },
                            {
                                value: 'cisco WS-C3750X-12S',
                            },
                            {
                                value: 'GigabitEthernet2/0/12',
                            }
                        ];
                        break;
                    case '.3.4':
                        result = [
                            {
                                value: 'some34.hostname.com',
                            },
                            {
                                value: 'GigabitEthernet2/3/34',
                            },
                            {
                                valueHex: '22222222'
                            },
                            {
                                value: 'cisco WS-C3750X-12S',
                            },
                            {
                                value: 'GigabitEthernet2/0/12',
                            }
                        ];
                        break;
                        case '.4.2':
                        result = [
                            {
                                value: 'some42.hostname.com',
                            },
                            {
                                value: 'GigabitEthernet2/3/42',
                            },
                            {
                                valueHex: '2a2a2a2a'
                            },
                            {
                                value: 'cisco WS-C3750X-12S',
                            },
                            {
                                value: 'GigabitEthernet2/0/12',
                            }
                        ];
                        break;
                }
                return Promise.resolve(result);
            }
            this.close = sinon.spy();
        }
    }
});
var findCdpNeighbors = require('../../../js/modules/findCdpNeighbors');



describe('findCdpNeighbors:', function(){
    
    beforeEach(function(){
        hasCDP = true;
        snmpErrorGetSubtree = false;
    })
    
    it('should take 2 arguments', function(){
        (function(){findCdpNeighbors('test')}).should.throw('The function takes 2 arguments!');
        (function(){findCdpNeighbors('arg1', 'arg2')}).should.not.throw();
    });
    it('should throw when host:string or community:string are not of proper type', function(){
        (function(){findCdpNeighbors(13,'jahoda')}).should.throw('host must be a string, invalid type (number)');
        (function(){findCdpNeighbors('jahoda',13)}).should.throw('community must be a string, invalid type (number)');
        (function(){findCdpNeighbors('arg1','arg2')}).should.not.throw();
    });
    it('should return a promise', function(){
        findCdpNeighbors('arg1', 'arg2').should.be.a.Promise();
    });
    it('should find cdp indexes first', function(){
        return findCdpNeighbors('arg1', 'arg2')
        .then(function(){
            findCdpNeighbors.cdpIndexes.should.be.eql([
                '.2.5',
                '.3.4',
                '.4.2'
            ])
        });
    });
    it('should return an array of neighbors objects when fulfilled', function(){
        return findCdpNeighbors('arg1','arg2')
        .then(function(res){
            res.should.be.eql([
                {
                    neighborHostname: 'some25.hostname.com',
                    localInterface: 'GigabitEthernet2/3/25',
                    neighborIP: '25.25.25.25',
                    neighborPlatform: 'cisco WS-C3750X-12S',
                    neighborPort: 'GigabitEthernet2/0/12'
                },
                { 
                    neighborHostname: 'some34.hostname.com',
                    localInterface: 'GigabitEthernet2/3/34',
                    neighborIP: '34.34.34.34',
                    neighborPlatform: 'cisco WS-C3750X-12S',
                    neighborPort: 'GigabitEthernet2/0/12' 
                },
                {
                    neighborHostname: 'some42.hostname.com',
                    localInterface: 'GigabitEthernet2/3/42',
                    neighborIP: '42.42.42.42',
                    neighborPlatform: 'cisco WS-C3750X-12S',
                    neighborPort: 'GigabitEthernet2/0/12' 
                }
            ]);
        });
    });
    it('should return an empty array if CDP is not supported on a device or no neighbors found', function(){
        hasCDP = false;
        return findCdpNeighbors('arg1', 'arg2')
        .then(function(res){
            res.should.be.eql([]);
        });
    });
    it('should close the session once finished', function(){
        return findCdpNeighbors('arg1', 'arg2')
        .then(function(res){
            sinon.assert.called(findCdpNeighbors.session.close);
        });
    });
    it('should be rejected when error occured in findCdpIndexes and propagate error correctly', function(){
        snmpErrorGetSubtree = true;
        return findCdpNeighbors('arg1', 'arg2')
        .should.be.rejected()
        .then(function(err){
            err.should.be.error();
        })
    });
    it('should be rejected when error occured durin workQueue processing and propagate error correctly');
});





//describe('cdpNeighbor: - cdpCrawl only', function(){
//    it('should have prorotype Graph')
//    it('this.find(hostname) should return a promise');
//    it('this.find(hostname) should return list of neighbors');
//    it('this.find(hostname) should returned list of neighbors should have hostname and IP attributes');
//    it('this.find(hostname) should call #addNode(hostname) on each neighbor in the list');
//    it('this.find(hostname) should run #removeFromWorkQueue(hostname) only if #addNode(hostname) finished');
//});