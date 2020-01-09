'apply' in Reflect && (function () {
    try {
        return Reflect.apply(function () {
            return false;
        });
    } catch (error) {
        return Reflect.apply(function () {
            return true;
        }, null, []);
    }
}())