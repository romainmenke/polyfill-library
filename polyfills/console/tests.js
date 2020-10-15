/* eslint-env mocha, browser */
/* global proclaim */

describe('console', function () {
	it('exists', function () {
		proclaim.ok(!!(console));
	});

	it('has type object', function () {
		proclaim.equal(typeof console, "object");
	});

	it('is an instance of Object', function () {
		proclaim.isInstanceOf(console, Object);
	});
});
