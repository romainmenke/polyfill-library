/* eslint-env mocha, browser */
// eslint-disable-next-line no-unused-vars
/* globals proclaim */

beforeEach(function () {
	var alpha = document.body.appendChild(document.createElement('DIV'));
	alpha.id = 'is-same-node-alpha';
	alpha.setAttribute('is-same-node', 'alpha');

	var beta = document.body.appendChild(document.createElement('DIV'));
	beta.id = 'is-same-node-beta';
	beta.setAttribute('is-same-node', 'beta');
});

describe('Node.prototype.isSameNode', function () {
	it('returns false with different nodes', function () {
		var x = document.getElementById('is-same-node-alpha');
		var y = document.getElementById('is-same-node-beta')

		proclaim.ok(!x.isSameNode(y));
	});

	it('returns true when used in itself', function () {
		var x = document.getElementById('is-same-node-alpha');

		proclaim.ok(x.isSameNode(x));
	});

	it('returns true with same node and getElementById', function () {
		var x = document.getElementById('is-same-node-alpha');
		var y = document.getElementById('is-same-node-alpha');

		proclaim.ok(x.isSameNode(y));
	});

	it('returns true with same node and querySelector by ID', function () {
		var x = document.querySelector('#is-same-node-alpha');
		var y = document.querySelector('#is-same-node-alpha');

		proclaim.ok(x.isSameNode(y));
	});

	it('returns true with same node and mixed getElementById, querySelector', function () {
		var x = document.getElementById('is-same-node-alpha');
		var y = document.querySelector('[is-same-node="alpha"]');

		proclaim.ok(x.isSameNode(y));
	});
});
