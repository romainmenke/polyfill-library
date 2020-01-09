'Symbol' in this && this.Symbol.length === 0 && (function () {
    try {
        return String(Symbol()) && Object.getOwnPropertySymbols &&
            Object.getOwnPropertySymbols('test') &&
            Symbol['for'] &&
            Symbol.keyFor &&
            JSON.stringify([Symbol()]) == '[null]' &&
            JSON.stringify({
                a: Symbol()
            }) == '{}' &&
            JSON.stringify(Object(Symbol())) == '{}' &&
            Symbol.prototype[Symbol.toPrimitive] &&
            Symbol.prototype[Symbol.toStringTag];
    } catch (err) {
        return false;
    }
})()