'construct' in Reflect && (function () {
    try {
        return !Reflect.construct(function () {
            /* empty */ });
    } catch (error) {
        /* empty */ }

    function F() {
        /* empty */ }
    return Reflect.construct(function () {
        /* empty */ }, [], F) instanceof F;
}())