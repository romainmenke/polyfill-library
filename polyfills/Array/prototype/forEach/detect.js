'forEach' in Array.prototype && (function () {
    try {
        Array.prototype.forEach.call(null, function () {});
        return false;
    } catch (error) {
        return true;
    }
}())