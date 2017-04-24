'use strict';

var proxyquire = require('proxyquire');
var should = require('should');
var sinon = require('sinon');

proxyquire('../../../js/modules/findCdpNeighbors',{
    'snmp-native': {
        Session: function Session(sessionConfigObj){
            var self = this;//we remember the Session object to later
            //assign options object to it
            this.getSubtreeAsync = function sessionGetSubtreeAsync(){
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
            this.getAllAsync = function sessionGetAllAsync(){
                return Promise.resolve([
                    {
                        value: 'some.hostname.com',
                    },
                    {
                        value: 'GigabitEthernet2/3/8',
                    },
                    {
                        value: '\n\u0006@>',
                        valueHex: '0a06403e',
                    },
                    {
                        value: 'cisco WS-C3750X-12S',
                    },
                    {
                        value: 'GigabitEthernet2/0/12',
                    }
                ]);
            }
            this.close = sinon.spy();
        }
    }
});
var findCdpNeighbors = require('../../../js/modules/findCdpNeighbors');



describe('findCdpNeighbors:', function(){
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
        findCdpNeighbors('arg1', 'arg2')
        .then(function(){
            findCdpNeighbors.cdpIndexes.should.be.eql([
                '.2.5',
                '.3.4',
                '.4.2'
            ])
        });
    });
    it('should return an array of neighbors objects when fulfilled');
    it('should be rejected when error occured in findCdpIndexes and propagate error correctly');
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