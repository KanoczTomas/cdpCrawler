'use strict';



proxyquire('../../../js/modules/findSnmpCommunity',{
    'snmp-native': {
        Session: function Session(sessionConfigObj){
            var self = this;//we remember the Session object to later
            //assign options object to it
            this.getSubtreeAsync = function sessionGetSubtreeAsync(configObj){
                this.configObj = configObj;
                this.sessionConfigObj = sessionConfigObj;
                return Promise.resolve([ 
                    VarBind {
                        oid: [ 1, 3, 6, 1, 4, 1, 9, 9, 23, 1, 2, 1, 1, 6, 2, 5 ],
                    },
                    VarBind {
                        oid: [ 1, 3, 6, 1, 4, 1, 9, 9, 23, 1, 2, 1, 1, 6, 3, 4 ],
                    },
                    VarBind {
                        oid: [ 1, 3, 6, 1, 4, 1, 9, 9, 23, 1, 2, 1, 1, 6, 4, 2 ],
                    }
                ]);
            };
            this.close = sinon.spy();
        }
    }
});




describe('findCdpNeighbors:', function(){
    it('should take 2 arguments');
    it('should throw when host:string or community:string are not of proper type');
    it('should find cdp indexes first');
    it('should return a promise');
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