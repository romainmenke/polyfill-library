'isFrozen' in Object && (function() {
    try {
        return Object.isFrozen('qwe');
    } catch (e) {
        return false;
    }
}())