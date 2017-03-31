'use strict';

var proxyquire = require('proxyquire');
var should = require('should');
var sinon = require('sinon');

proxyquire('../../../js/modules/findSnmpCommunity',{
    'config': {
        results: [
            'jahoda;pass',//if set to fail it will throw - emulating snmp failure
            'pohoda;pass',
            'malina;pass'
        ],
        get: function configGet(input){
            if(input === 'snmp.communities') return this.results;
            else if(input === 'snmp.oids') return {hostname: '.1.2.3.test'};
        },
        set: function configSet(input){
            this.results = input;
        },
        spyOn: function(){
            return sinon.spy(this,'get');
        },
        spyOff: function(){
            this.get.restore();
        }
        
    },
    'snmp-native': {
        configure: function configure(success){
            this.success = success;
        },
        Session: function(sessionConfigObj){
            this.get = function sessionGet(configObj, callback){
                this.configObj = configObj;
                this.sessionConfigObj = sessionConfigObj;
                if(sessionConfigObj.community.split(";")[1] === 'pass') {
                    setTimeout(function(){
                        callback(null, {dummy: 'test'});
                    },Math.random()*1000);
                }
                else {
                    setTimeout(function(){
                        callback(Error('timed out'));
                    },Math.random()*2000);
                }
            }
        }
    }
});


var findSnmpCommunity = require('../../../js/modules/findSnmpCommunity');

describe('findSnmpCommunity:', function(){
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
        findSnmpCommunity.sessions[0].sessionConfigObj.community.should.be.equal('jahoda;pass');
        findSnmpCommunity.sessions[1].sessionConfigObj.community.should.be.equal('pohoda;pass');
        findSnmpCommunity.sessions[2].sessionConfigObj.community.should.be.equal('malina;pass');
    });
    it('should take oids from a config file', function(){
        findSnmpCommunity('host');
        findSnmpCommunity.sessions[0].configObj.oid.should.be.equal('.1.2.3.test');
    });
    it('should search communities in parallel');
    it('should resolve as soon as community found');
    it('should stop all snmp sessions after community found');
    it('should pass snmp error in case snmp failed for all');
    it('should return error "community not found" on rejection');
});