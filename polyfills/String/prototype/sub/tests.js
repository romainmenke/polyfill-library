/* eslint-env mocha */
/* globals proclaim */

it('is a function', function () {
	proclaim.isFunction(String.prototype.sub);
});

it('has correct arity', function () {
	proclaim.arity(String.prototype.sub, 1);
});

it('has correct name', function () {
	proclaim.hasName(String.prototype.sub, 'sub');
});

it('is not enumerable', function () {
	proclaim.isNotEnumerable(String.prototype, 'sub');
});

it('should throw a TypeError when called with undefined context', function () {
    proclaim.throws(function () {
        String.prototype.sub.call(undefined);
    }, TypeError);
});

it('should throw a TypeError when called with null context', function () {
    proclaim.throws(function () {
        String.prototype.sub.call(null);
    }, TypeError);
});

it('works on strings correctly', function() {
	proclaim.deepEqual('_'.sub(), '<sub>_</sub>');
	proclaim.deepEqual('<'.sub(), '<sub><</sub>');
	proclaim.deepEqual(String.prototype.sub.call(1234), '<sub>1234</sub>');
});