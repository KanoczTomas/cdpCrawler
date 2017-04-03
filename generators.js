var Promise = require("bluebird");


//arguments [valueWhenFulfilled, delay, errorToThrow]
// has to iterate through all communities
//has to do them in parallel

var scenarios = [
    ['jahoda', 500, ],
    ['malina', 200, 'failed j'],
    ['pohoda', 300, 'failed p']
]

function promisify(arr){
    var arrPromises = [];
    arr.forEach(function(value, index){
        var valueWhenFulfilled = value[0];
        var delay = value[1];
        var errorToThrow = value[2];
        
        if(typeof delay !== 'number') throw new Error('invalid delay given in scenario ' + Number(index + 1) + ' (' + delay + ') should be of type number instead of ' + typeof delay);
        
        arrPromises.push(Promise.delay(delay)
        .then(function(){
            if(errorToThrow) return Promise.reject(errorToThrow);
            else return Promise.resolve(valueWhenFulfilled);
        }));
        
    });
    return arrPromises;
}

var main = Promise.coroutine(function *gen(){
    try{
        var result = yield Promise.any(promisify(scenarios));
        return Promise.resolve(result);
    }
    catch(err){
        //console.log('there was an error', err);
        return Promise.resolve(err);
    }
})();
main.then(function(result){
    console.log(result);
})


