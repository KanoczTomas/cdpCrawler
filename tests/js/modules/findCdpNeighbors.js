'use strict';

describe('cdpNeighbor:', function(){
    it('should have prorotype Graph')
    it('this.find(hostname) should return a promise');
    it('this.find(hostname) should return list of neighbors');
    it('this.find(hostname) should returned list of neighbors should have hostname and IP attributes');
    it('this.find(hostname) should call #addNode(hostname) on each neighbor in the list');
    it('this.find(hostname) should run #removeFromWorkQueue(hostname) only if #addNode(hostname) finished');
});