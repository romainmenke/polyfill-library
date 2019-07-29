/* eslint-env mocha */
/* globals proclaim */

it('is a function', function () {
	proclaim.isFunction(String.prototype.italics);
});

it('has correct arity', function () {
	proclaim.arity(String.prototype.italics, 1);
});

it('has correct name', function () {
	proclaim.hasName(String.prototype.italics, 'italics');
});

it('is not enumerable', function () {
	proclaim.isNotEnumerable(String.prototype, 'italics');
});

it('should throw a TypeError when called with undefined context', function () {
    proclaim.throws(function () {
        String.prototype.italics.call(undefined);
    }, TypeError);
});

it('should throw a TypeError when called with null context', function () {
    proclaim.throws(function () {
        String.prototype.italics.call(null);
    }, TypeError);
});

it('works on strings correctly', function() {
	proclaim.deepEqual('_'.italics(), '<i>_</i>');
	proclaim.deepEqual('<'.italics(), '<i><</i>');
	proclaim.deepEqual(String.prototype.italics.call(1234), '<i>1234</i>');
});