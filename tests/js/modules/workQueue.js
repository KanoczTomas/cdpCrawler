'use strict';

describe('WorkQueue:', function(){
    it('should have attribute toDo which is a list');
    it('attribute toDo should be empty on start');
    it('toDo members should be objects with community, hostname and error attributes');
    it('should have attribute done which is a list');
    it('attribute done should be empty on start');
    it('this.addToWorkQueue(hostname) should call findSnmpCommunity and add entry to toDO after getting community');
    it('should add toDo.filter(hostname) to work queue only if not done.filter(hostname) false');
    it('this.removeFromWorkQueue(hostname) should be called after queue work function finishes');
    it('this.removeFromWorkQueue(hosntmae) should move toDo.filter(hostname) to done Array');
    it('this.finishJobs() should be called after work queue empty');
    it('this.finishJobs() should output all nodes as a list');
    it('this.finishJobs(serialize=true) should output Graph serialized');
});