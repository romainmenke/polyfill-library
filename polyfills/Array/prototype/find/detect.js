'find' in Array.prototype && (function () {
    var skipsHoles = true;
    Array(1).find(function () {
        return skipsHoles = false;
    });
    return !skipsHoles && Array.prototype[Symbol.unscopables].find;
}())