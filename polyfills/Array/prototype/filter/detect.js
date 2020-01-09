'filter' in Array.prototype && (function () {
    const array = [];
    const constructor = array.constructor = {};
    constructor[Symbol.species] = function () {
        return {
            foo: 1
        };
    };
    return array.filter(Boolean).foo === 1;
}())