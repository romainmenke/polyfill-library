/* eslint-disable mocha/no-top-level-hooks */
/* eslint-disable mocha/no-hooks-for-single-case */
/* eslint-env mocha */

'use strict';

const assert = require('proclaim');
const mockery = require('mockery');
const sinon = require('sinon');

sinon.assert.expose(assert, {
	includeFail: false,
	prefix: ''
});

beforeEach(function() {
	mockery.enable({
		useCleanCache: true,
		warnOnUnregistered: false,
		warnOnReplace: false
	});
});

afterEach(function() {
	mockery.deregisterAll();
	mockery.disable();
});
