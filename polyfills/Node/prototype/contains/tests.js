/* eslint-env mocha, browser */
/* global proclaim */

// Note: Function length is incorrectly reported as 0 in MS Edge (IE12), but this is intentionally not tested

describe('on an element', function () {
	var documentElement = document.documentElement;
	var documentHead = document.getElementsByTagName('head')[0];
	var detached = document.createElement('div');
	

	it('is a function', function () {

		// Asserting using to.be.a('function') in this case causes a hard browser crash in IE6
		proclaim.isInstanceOf(documentElement.contains, Function);
	});

	it('functions correctly', function () {
		proclaim.equal(documentElement.contains(documentElement), true);
		proclaim.equal(documentElement.contains(documentHead), true);

		proclaim.equal(documentHead.contains(documentElement), false);
		proclaim.equal(documentHead.contains(null), false);
	});

	it('functions correctly (on detached elements)', function () {
		proclaim.equal(detached.contains(detached), true);

		proclaim.equal(documentElement.contains(detached), false);
		proclaim.equal(detached.contains(documentElement), false);
		proclaim.equal(documentHead.contains(null), false);
	});

	// Native implementations on Safari (desktop and iOS) as of v9 return false when no argument is supplied
	it.skip('throws when missing the argument', function () {
		proclaim["throws"](function () {
			documentElement.contains();
		});
	});
});

describe('on the document', function () {
	var
	documentElement = document.documentElement,
	documentHead = document.getElementsByTagName('head')[0],
	detached = document.createElement('div');

	it('is a function', function () {
		proclaim.isInstanceOf(document.contains, Function);
	});

	it('functions correctly', function () {
		proclaim.equal(document.contains(document), true);
		proclaim.equal(document.contains(documentElement), true);
		proclaim.equal(document.contains(documentHead), true);

		proclaim.equal(document.contains(detached), false);
		proclaim.equal(documentElement.contains(document), false);
	});

	// Native implementations on Safari (desktop and iOS) as of v9 return false when no argument is supplied
	it.skip('throws when missing the argument', function () {
		proclaim["throws"](function () {
			document.contains();
		});
	});

	describe('on a fragment', function () {
		var fragmentA = document.createDocumentFragment();
		var fragmentElA = document.createElement('div');
		fragmentA.appendChild(fragmentElA);
		var fragmentB = new DocumentFragment();
		var fragmentElB = document.createElement('div');
		fragmentB.appendChild(fragmentElB);

		var detached = document.createElement('div');
		

		it('is a function', function () {

			// Asserting using to.be.a('function') in this case causes a hard browser crash in IE6
			proclaim.isInstanceOf(fragmentA.contains, Function);
			proclaim.isInstanceOf(fragmentB.contains, Function);
		});

		it('functions correctly', function () {
			proclaim.equal(fragmentA.contains(fragmentA), true);
			proclaim.equal(fragmentB.contains(fragmentB), true);
			proclaim.equal(fragmentA.contains(fragmentElA), true);
			proclaim.equal(fragmentB.contains(fragmentElB), true);

			proclaim.equal(fragmentElA.contains(fragmentA), false);
			proclaim.equal(fragmentElB.contains(fragmentB), false);
			proclaim.equal(fragmentElB.contains(null), false);
			proclaim.equal(fragmentElB.contains(null), false);
		});

		it('functions correctly (on detached elements)', function () {
			proclaim.equal(fragmentA.contains(detached), false);
			proclaim.equal(fragmentB.contains(detached), false);
		});

		// Native implementations on Safari (desktop and iOS) as of v9 return false when no argument is supplied
		it.skip('throws when missing the argument', function () {
			proclaim["throws"](function () {
				fragmentA.contains();
				fragmentB.contains();
			});
		});
	});
});
