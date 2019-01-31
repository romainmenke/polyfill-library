/* eslint-env mocha */
/* globals proclaim, ArrayBuffer, Symbol, SharedArrayBuffer */

describe('constructor', function () {
    it('is a function', function () {
        proclaim.isFunction(ArrayBuffer);
    });

    it('has correct arity', function () {
        proclaim.arity(ArrayBuffer, 1);
    });

    it('has correct name', function () {
        proclaim.hasName(ArrayBuffer, 'ArrayBuffer');
    });

    it('is not enumerable', function () {
        proclaim.isNotEnumerable(self, 'ArrayBuffer');
    });

    it('throws RangeError when constructed with a negative length', function () {
        proclaim.throws(function () {
            new ArrayBuffer(-1);
        }, RangeError);
    });

    it('does not throw when constructed with no length', function () {
        proclaim.doesNotThrow(function () {
            new ArrayBuffer();
        });
    });

    it('does not throw when constructed with fractional length', function () {
        proclaim.doesNotThrow(function () {
            new ArrayBuffer(0.5);
        });
    });

    it('constructs an ArrayBugger with a byteLength equivalent to the length argument', function () {
        proclaim.deepStrictEqual(new ArrayBuffer(12).byteLength, 12);
    });

    it('has the correct species', function () {
        proclaim.deepStrictEqual(ArrayBuffer[Symbol.species], ArrayBuffer);
    });
});

describe('ArrayBuffer.isView', function () {
    it('is a function', function () {
        proclaim.isFunction(ArrayBuffer.isView);
    });

    it('has correct arity', function () {
        proclaim.arity(ArrayBuffer.isView, 1);
    });

    it('has correct name', function () {
        proclaim.hasName(ArrayBuffer.isView, 'isView');
    });

    it('is not enumerable', function () {
        proclaim.isNotEnumerable(ArrayBuffer, 'isView');
    });

    it('returns false when given no argument', function () {
        proclaim.isFalse(ArrayBuffer.isView());
    });

    it('returns false when given an array as argument', function () {
        proclaim.isFalse(ArrayBuffer.isView([]));
    });

    it('returns false when given an object as argument', function () {
        proclaim.isFalse(ArrayBuffer.isView({}));
    });

    it('returns false when given null as argument', function () {
        proclaim.isFalse(ArrayBuffer.isView(null));
    });

    it('returns false when given undefined as argument', function () {
        proclaim.isFalse(ArrayBuffer.isView(undefined));
    });

    it('returns false when given number as argument', function () {
        proclaim.isFalse(ArrayBuffer.isView(1));
    });

    it('returns false when given string as argument', function () {
        proclaim.isFalse(ArrayBuffer.isView('d'));
    });

    it('returns false when given RegExp as argument', function () {
        proclaim.isFalse(ArrayBuffer.isView(/./));
    });

    it('returns false when given ArrayBuffer as argument', function () {
        proclaim.isFalse(ArrayBuffer.isView(new ArrayBuffer));
    });

    it('returns false when given function as argument', function () {
        proclaim.isFalse(ArrayBuffer.isView(function () {}));
    });

    it('returns false when given boolean as argument', function () {
        proclaim.isFalse(ArrayBuffer.isView(false));
    });

    it('returns true when given Int8Array as argument', function () {
        proclaim.isTrue(ArrayBuffer.isView(new Int8Array));
    });

    it('returns true when given Uint8Array as argument', function () {
        proclaim.isTrue(ArrayBuffer.isView(new Uint8Array));
    });

    it('returns true when given Uint8ClampedArray as argument', function () {
        proclaim.isTrue(ArrayBuffer.isView(new Uint8ClampedArray));
    });

    it('returns true when given Int16Array as argument', function () {
        proclaim.isTrue(ArrayBuffer.isView(new Int16Array));
    });

    it('returns true when given Uint16Array as argument', function () {
        proclaim.isTrue(ArrayBuffer.isView(new Uint16Array));
    });

    it('returns true when given Int32Array as argument', function () {
        proclaim.isTrue(ArrayBuffer.isView(new Int32Array));
    });

    it('returns true when given Uint32Array as argument', function () {
        proclaim.isTrue(ArrayBuffer.isView(new Uint32Array));
    });

    it('returns true when given Float32Array as argument', function () {
        proclaim.isTrue(ArrayBuffer.isView(new Float32Array));
    });

    it('returns true when given Float64Array as argument', function () {
        proclaim.isTrue(ArrayBuffer.isView(new Float64Array));
    });

    it('returns true when given DataView as argument', function () {
        proclaim.isTrue(ArrayBuffer.isView(new DataView(new ArrayBuffer)));
    });
});

describe('ArrayBuffer.prototype.slice', function () {
    it('is a function', function () {
        proclaim.isFunction(ArrayBuffer.prototype.slice);
    });

    it('has correct arity', function () {
        proclaim.arity(ArrayBuffer.prototype.slice, 2);
    });

    it('has correct name', function () {
        proclaim.hasName(ArrayBuffer.prototype.slice, 'slice');
    });

    it('is not enumerable', function () {
        proclaim.isNotEnumerable(ArrayBuffer.prototype, 'slice');
    });

    it('throws TypeError if `this` does not have an [[ArrayBufferData]] internal slot', function () {
        proclaim.throws(function () {
            ArrayBuffer.prototype.slice.call({});
        }, TypeError);

        proclaim.throws(function () {
            ArrayBuffer.prototype.slice.call([]);
        }, TypeError);
    });

    it('throws a TypeError if `this` is a SharedArrayBuffer', function () {
        proclaim.throws(function () {
            ArrayBuffer.prototype.slice.call(new SharedArrayBuffer(0));
        }, TypeError);
    });

    it('throws TypeError if `this` is not an Object', function () {
        proclaim.throws(function () {
            ArrayBuffer.prototype.slice.call(undefined);
        }, TypeError);

        proclaim.throws(function () {
            ArrayBuffer.prototype.slice.call(null);
        }, TypeError);

        proclaim.throws(function () {
            ArrayBuffer.prototype.slice.call(true);
        }, TypeError);

        proclaim.throws(function () {
            ArrayBuffer.prototype.slice.call("");
        }, TypeError);

        proclaim.throws(function () {
            ArrayBuffer.prototype.slice.call(Symbol());
        }, TypeError);

        proclaim.throws(function () {
            ArrayBuffer.prototype.slice.call(1);
        }, TypeError);
    });

    it('if `end` argument is absent, end is set to [[ArrayBufferByteLength]]', function () {
        proclaim.deepStrictEqual(new ArrayBuffer(9).slice(5).byteLength, 4);
    });

    it('if `end` argument is undefined, end is set to [[ArrayBufferByteLength]]', function () {
        proclaim.deepStrictEqual(new ArrayBuffer(9).slice(5, undefined).byteLength, 4);
    });

    it('if `end` argument is larger than [[ArrayBufferByteLength]], end is set to [[ArrayBufferByteLength]]', function () {
        proclaim.deepStrictEqual(new ArrayBuffer(9).slice(5, 100).byteLength, 4);
        proclaim.deepStrictEqual(new ArrayBuffer(9).slice(5, Infinity).byteLength, 4);
        proclaim.deepStrictEqual(new ArrayBuffer(9).slice(5, 0x100000).byteLength, 4);
    });

    it('is extensible', function () {
        proclaim.isTrue(Object.isExtensible(ArrayBuffer.prototype.slice));
    });

    it('if `end` is negative, it is subtracted from [[ArrayBufferByteLength]]', function () {
        proclaim.deepStrictEqual(new ArrayBuffer(9).slice(4, -2).byteLength, 3);
        proclaim.deepStrictEqual(new ArrayBuffer(9).slice(4, -10).byteLength, 0);
        proclaim.deepStrictEqual(new ArrayBuffer(9).slice(4, -Infinity).byteLength, 0);
    });

    it('the `start` argument is converted to an integer', function () {
        proclaim.deepStrictEqual(new ArrayBuffer(9).slice(4.5).byteLength, 5);
        proclaim.deepStrictEqual(new ArrayBuffer(9).slice(NaN).byteLength, 9);
    });

    it('the `end` argument is converted to an integer', function () {
        proclaim.deepStrictEqual(new ArrayBuffer(9).slice(0, 4.5).byteLength, 4);
        proclaim.deepStrictEqual(new ArrayBuffer(9).slice(0, NaN).byteLength, 0);
    });

    it('if `start` is negative, it is relative to [[ArrayBufferByteLength]]', function () {
        proclaim.deepStrictEqual(new ArrayBuffer(9).slice(-5, 6).byteLength, 2);
        proclaim.deepStrictEqual(new ArrayBuffer(9).slice(-10, 6).byteLength, 6);
        proclaim.deepStrictEqual(new ArrayBuffer(9).slice(-Infinity, 6).byteLength, 2);
    });

    it('throws a TypeError if called with `new`', function () {
        proclaim.throws(function () {
            new Array.prototype.slice();
        });
    });

    it('does not have a prototype property', function () {
        proclaim.isFalse(Object.prototype.hasOwnProperty.call(ArrayBuffer.prototype.slice, "prototype"));
    });

    it('throws TypeError if `constructor` property is not an object', function () {
        proclaim.throws(function () {
            var a = new ArrayBuffer();
            a.constructor = null;
            a.slice();
        }, TypeError);

        proclaim.throws(function () {
            var a = new ArrayBuffer();
            a.constructor = true;
            a.slice();
        }, TypeError);

        proclaim.throws(function () {
            var a = new ArrayBuffer();
            a.constructor = "";
            a.slice();
        }, TypeError);

        proclaim.throws(function () {
            var a = new ArrayBuffer();
            a.constructor = 1;
            a.slice();
        }, TypeError);

        proclaim.throws(function () {
            var a = new ArrayBuffer();
            a.constructor = Symbol();
            a.slice();
        }, TypeError);
    });

    it('Uses ArrayBuffer constructor as the constructor if `constructor` property is undefined', function () {
        var arrayBuffer = new ArrayBuffer();
        arrayBuffer.constructor = undefined;
        proclaim.deepStrictEqual(Object.getPrototypeOf(arrayBuffer.slice()), ArrayBuffer.prototype);
    });

    it('throws a TypeError if species constructor is not a constructor function', function () {
        var speciesConstructor = {};
        speciesConstructor[Symbol.species] = {};
        var arrayBuffer = new ArrayBuffer();
        arrayBuffer.constructor = speciesConstructor;
        proclaim.throws(function () {
            arrayBuffer.slice();
        }, TypeError);
    });

    it('throws a TypeError if species constructor is not an object', function () {

        proclaim.throws(function () {
            var speciesConstructor = {};
            speciesConstructor[Symbol.species] = true;
            var arrayBuffer = new ArrayBuffer();
            arrayBuffer.constructor = speciesConstructor;
            arrayBuffer.slice();
        }, TypeError);

        proclaim.throws(function () {
            var speciesConstructor = {};
            speciesConstructor[Symbol.species] = "";
            var arrayBuffer = new ArrayBuffer();
            arrayBuffer.constructor = speciesConstructor;
            arrayBuffer.slice();
        }, TypeError);

        proclaim.throws(function () {
            var speciesConstructor = {};
            speciesConstructor[Symbol.species] = Symbol();
            var arrayBuffer = new ArrayBuffer();
            arrayBuffer.constructor = speciesConstructor;
            arrayBuffer.slice();
        }, TypeError);

        proclaim.throws(function () {
            var speciesConstructor = {};
            speciesConstructor[Symbol.species] = 1;
            var arrayBuffer = new ArrayBuffer();
            arrayBuffer.constructor = speciesConstructor;
            arrayBuffer.slice();
        }, TypeError);
    });

    it('uses ArrayBuffer constructor if species constructor is null', function () {
        var speciesConstructor = {};
        speciesConstructor[Symbol.species] = null;
        var arrayBuffer = new ArrayBuffer();
        arrayBuffer.constructor = speciesConstructor;
        proclaim.deepStrictEqual(Object.getPrototypeOf(arrayBuffer.slice()), ArrayBuffer.prototype);
    });

    it('uses ArrayBuffer constructor if species constructor is undefined', function () {
        var speciesConstructor = {};
        speciesConstructor[Symbol.species] = undefined;
        var arrayBuffer = new ArrayBuffer();
        arrayBuffer.constructor = speciesConstructor;
        proclaim.deepStrictEqual(Object.getPrototypeOf(arrayBuffer.slice()), ArrayBuffer.prototype);
    });

    it('if `start` is absent, it defaults to 0', function () {
        proclaim.deepStrictEqual(new ArrayBuffer(9).slice().byteLength, 9);
    });

    it('if `start` is undefined, it defaults to 0', function () {
        proclaim.deepStrictEqual(new ArrayBuffer(9).slice(undefined).byteLength, 9);
    });

    it('returns 0 sized buffer is `start` is greater than `end`', function () {
        proclaim.deepStrictEqual(new ArrayBuffer(9).slice(5, 4).byteLength, 0);
    });

    it('if `start` is greater than [[ArrayBufferByteLength]], `start` is set to [[ArrayBufferByteLength]]', function () {
        proclaim.deepStrictEqual(new ArrayBuffer(9).slice(10, 5).byteLength, 0);
        proclaim.deepStrictEqual(new ArrayBuffer(9).slice(Infinity, 5).byteLength, 0);
        proclaim.deepStrictEqual(new ArrayBuffer(9).slice(0x10000, 5).byteLength, 0);
    });

    it('throws a TypeError if new ArrayBuffer is too small', function () {
        proclaim.throws(function () {
            var arrayBuffer = new ArrayBuffer(9);
            arrayBuffer.constructor = {};
            arrayBuffer.constructor[Symbol.species] = function () {
                return new ArrayBuffer();
            };
            arrayBuffer.slice();
        }, TypeError);
    });

    it('throws a TypeError if species constructor returns `this` value', function () {
        proclaim.throws(function () {
            var arrayBuffer = new ArrayBuffer(9);
            arrayBuffer.constructor = {};
            arrayBuffer.constructor[Symbol.species] = function () {
                return arrayBuffer;
            };
            arrayBuffer.slice();
        }, TypeError);
    });

    it('throws a TypeError if new object is not an ArrayBuffer instance', function () {
        proclaim.throws(function () {
            var arrayBuffer = new ArrayBuffer(9);
            arrayBuffer.constructor = {};
            arrayBuffer.constructor[Symbol.species] = function () {
                return {};
            };
            arrayBuffer.slice();
        }, TypeError);
    });

    it('does not throw a TypeError if new ArrayBuffer is too large', function () {
        var arrayBuffer = new ArrayBuffer(8);
        arrayBuffer.constructor = {};
        arrayBuffer.constructor[Symbol.species] = function () {
            return new ArrayBuffer(10);
        };

        proclaim.deepStrictEqual(arrayBuffer.slice().byteLength, 10);
    });
});

describe('ArrayBuffer.prototype.byteLength', function () {
    it('throws a TypeError if called by something without an [[ArrayBufferData]] internal slot', function () {
        proclaim.throws(function () {
            ArrayBuffer.prototype.byteLength;
        }, TypeError);
    });

    it('is the value of the [[ByteLength]] internal slot', function () {
        proclaim.deepStrictEqual(new ArrayBuffer(0).byteLength, 0);

        proclaim.deepStrictEqual(new ArrayBuffer(9).byteLength, 9);
    });
});