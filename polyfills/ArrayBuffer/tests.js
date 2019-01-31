/* eslint-env mocha */
/* globals proclaim, ArrayBuffer, Symbol */

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

