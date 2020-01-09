'indexOf' in Array.prototype && (function () {
    try {
        Array.prototype.indexOf.call(null);
    } catch (error) {
        return 1 / [1].indexOf(1, -0) > 0;
    }
}())