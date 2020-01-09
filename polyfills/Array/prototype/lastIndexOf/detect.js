'lastIndexOf' in Array.prototype && (function () {
    try {
        Array.prototype.lastIndexOf.call(null);
    } catch (error) {
        return 1 / [1].lastIndexOf(1, -0) > 0;
    }
}())