'isExtensible' in Object && (function() {
    try {
        return !Object.isExtensible('qwe');
    } catch (e) {
        return false;
    }
}())