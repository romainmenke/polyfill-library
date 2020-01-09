'findIndex' in Array.prototype && (function () {
    var skipsHoles = true;
    Array(1).findIndex(function () {
        return skipsHoles = false;
    });
    return !skipsHoles && Array.prototype[Symbol.unscopables].findIndex
}())