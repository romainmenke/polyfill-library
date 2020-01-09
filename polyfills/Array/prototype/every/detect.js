'every' in Array.prototype && (function () {
    try {
        Array.prototype.every.call(null, function () {});
        return false;
    } catch (error) {
        return true;
    }
}())