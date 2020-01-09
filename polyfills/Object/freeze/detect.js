'freeze' in Object && (function () {
    try {
        return Object.freeze(true);
    } catch (e) {
        return false;
    }
}())