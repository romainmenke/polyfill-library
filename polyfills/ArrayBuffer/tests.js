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

