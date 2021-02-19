/* eslint-env mocha, browser */
// eslint-disable-next-line no-unused-vars
/* globals proclaim */

describe('querySelector', function () {
	it('does not throw', function () {
		proclaim.doesNotThrow(function () {
			var div = document.createElement('div');
			document.body.appendChild(div);
			
			div.querySelector(':scope *');
			div.querySelectorAll(':scope *');
		});
	});

	it('can query element with :scope', function () {
		var divA = document.createElement('div');
		document.body.appendChild(divA);

		var divB = document.createElement('div');
		divB.className = 'wanted scoped';

		divA.appendChild(divB);

		var divC = document.createElement('div');
		divC.className = 'wanted on-body';

		document.body.appendChild(divC);

		proclaim.equal(divA.querySelectorAll(':scope .wanted').length, 1);
		proclaim.equal(divA.querySelector(':scope .wanted'), divB);
	});
});
