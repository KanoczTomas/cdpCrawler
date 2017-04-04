'use strict';

var proxyquire = require('proxyquire');
var Promise = require('bluebird');
var should = require('should');
var sinon = require('sinon');

var scenario;
function resetScenario(){
    scenario =  [
        {community: 'jahoda',
         delay: 200,
         fail: false
        },
        {community: 'malina',
         delay: 600,
         fail: false
        },
        {community: 'pohoda',
         delay: 700,
         fail: false
        }
    ];
};
resetScenario();


proxyquire('../../../js/modules/findSnmpCommunity',{
    'config': {
        results: [
            'jahoda',
            'pohoda',
            'malina'
        ],
        get: function configGet(input){
            if(input === 'snmp.communities') return this.results;
            else if(input === 'snmp.oids') return {hostname: '.1.2.3.test'};
        },
    },
    'snmp-native': {
        Session: function(sessionConfigObj){
            this.getAsync = function sessionGet(configObj){
                this.configObj = configObj;
                this.sessionConfigObj = sessionConfigObj;
                var communityObj = scenario.filter(function(elm){
                    return elm.community === sessionConfigObj.community;
                })[0];
                var resultPromise =  Promise.delay(communityObj.delay)
                .then(function(){
                    if(communityObj.fail) return Promise.reject(communityObj.fail);
                    else {
                        return Promise.resolve(communityObj.community);
                    }
                })  
                return resultPromise;
            };
            this.close = sinon.spy();
        }
    }
});


var findSnmpCommunity = require('../../../js/modules/findSnmpCommunity');

describe('findSnmpCommunity:', function(){
    
    
    beforeEach(function(){
        resetScenario();
    })
    
    it('should return a Promise', function(){
        findSnmpCommunity('host').should.be.a.Promise();
    });
    it('should take a string only as an argument', function(){
        (function(){findSnmpCommunity(123)}).should.throw('Bad input argument, should be of type string');//we must wrap the call to an anonymous function to make should catch the error
    });
    it('should set hostname argument correctly', function(){
        findSnmpCommunity('hostname');
        findSnmpCommunity.sessions[0].sessionConfigObj.host.should.be.equal('hostname');
    })
    it('should take community strings from a config file', function(){
        findSnmpCommunity('host');
        findSnmpCommunity.sessions[0].sessionConfigObj.community.should.be.equal('jahoda');
        findSnmpCommunity.sessions[1].sessionConfigObj.community.should.be.equal('pohoda');
        findSnmpCommunity.sessions[2].sessionConfigObj.community.should.be.equal('malina');
    });
    it('should take oids from a config file', function(){
        findSnmpCommunity('host');
        findSnmpCommunity.sessions[0].configObj.oid.should.be.equal('.1.2.3.test');
    });
    it('should resolve as soon as community found', function(){
        var p1 = findSnmpCommunity('host');
        scenario[2].delay = 100;
        var p2 = findSnmpCommunity('host');
        return Promise.all([ p1, p2 ])
        .then(function(res){
            res[0].should.be.equal('jahoda');
            res[1].should.be.equal('pohoda');
        });
    });
    it('should stop all snmp sessions after community found', function(){
        return findSnmpCommunity('host')
        .then(function(){
            sinon.assert.called(findSnmpCommunity.sessions[0].close);
            sinon.assert.called(findSnmpCommunity.sessions[1].close);
            sinon.assert.called(findSnmpCommunity.sessions[2].close);
        });
        
    });
    it('should pass snmp error in case snmp failed for all', function(){
        scenario[0].fail = 'failed jahoda';
        scenario[1].fail = 'failed malina';
        scenario[2].fail = 'failed pohoda';
        return findSnmpCommunity('host').should.be.rejected()
        .then(function(err){
            err.should.be.Error();
            err['0'].should.be.equal('failed jahoda');
            err['1'].should.be.equal('failed malina');
            err['2'].should.be.equal('failed pohoda');
        });
    });
});