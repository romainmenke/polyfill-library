'isSealed' in Object && (function() {
    try {
        return Object.isSealed('qwe');
    } catch (e) {
        return false;
    }
}())