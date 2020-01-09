'acosh' in Math && // V8 bug: https://code.google.com/p/v8/issues/detail?id=3509
    Math.floor(Math.acosh(Number.MAX_VALUE)) == 710 &&
    // Tor Browser bug: Math.acosh(Infinity) -> NaN
    Math.acosh(Infinity) == Infinity