'use strict';

describe('cdpCrawl:', function(){
    it('should use hostname as the only argument');
    it('should throw if hostname can not be resolved');
    it('should find all nodes correctly');
    it('should finish only if all nodes crawled');
    it('should have error attribute for nodes populated if there was an error during cdp or community snmp tasks');
    it('should output all nodes');
});