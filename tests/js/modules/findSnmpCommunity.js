'use strict';

describe('findSnmpCommunity:', function(){
    it('should be a Promise');
    it('should have object Graph as its prototype');
    it('should take community strings from a config file');
    it('should search communities in parallel');
    it('should resolve as soon as community found');
    it('should stop all snmp search after community found');
    it('should return error "community not found" on rejection');
});