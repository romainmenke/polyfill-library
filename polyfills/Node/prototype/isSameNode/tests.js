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

		proclaim.notOk(x.isSameNode(y));
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

/* WPT */
describe('WPT', function () {

	if ('createDocumentType' in document.implementation) { // IE 8 has no support for "document.implementation.createDocumentType"
		it('doctypes should be compared on reference', function () {
			var doctype1 = document.implementation.createDocumentType("qualifiedName", "publicId", "systemId");
			var doctype2 = document.implementation.createDocumentType("qualifiedName", "publicId", "systemId");

			proclaim.ok(doctype1.isSameNode(doctype1), "self-comparison");
			proclaim.notOk(doctype1.isSameNode(doctype2), "same properties");
			proclaim.notOk(doctype1.isSameNode(null), "with null other node");
		});
	}

	if ('createElementNS' in document) { // IE 8 has no support for "document.createElementNS"
		it('elements should be compared on reference (namespaced element)', function () {
			var element1 = document.createElementNS("namespace", "prefix:localName");
			var element2 = document.createElementNS("namespace", "prefix:localName");

			proclaim.ok(element1.isSameNode(element1), "self-comparison");
			proclaim.notOk(element1.isSameNode(element2), "same properties");
			proclaim.notOk(element1.isSameNode(null), "with null other node");
		});
	}

	if ('setAttributeNS' in document.documentElement) { // IE 8 has no support for "Element.prototype.setAttributeNS"
		it('elements should be compared on reference (namespaced attribute)', function () {
			var element1 = document.createElement("element");
			element1.setAttributeNS("namespace", "prefix:localName", "value");

			var element2 = document.createElement("element");
			element2.setAttributeNS("namespace", "prefix:localName", "value");

			proclaim.ok(element1.isSameNode(element1), "self-comparison");
			proclaim.notOk(element1.isSameNode(element2), "same properties");
			proclaim.notOk(element1.isSameNode(null), "with null other node");
		});
	}

	if ('createProcessingInstruction' in document) { // IE 8 has no support for "document.createProcessingInstruction"
		it('processing instructions should be compared on reference', function () {
			var pi1 = document.createProcessingInstruction("target", "data");
			var pi2 = document.createProcessingInstruction("target", "data");

			proclaim.ok(pi1.isSameNode(pi1), "self-comparison");
			proclaim.notOk(pi1.isSameNode(pi2), "different target");
			proclaim.notOk(pi1.isSameNode(null), "with null other node");
		});
	}

	it('text nodes should be compared on reference',function() {
		var text1 = document.createTextNode("data");
		var text2 = document.createTextNode("data");

		proclaim.ok(text1.isSameNode(text1), "self-comparison");
		proclaim.notOk(text1.isSameNode(text2), "same properties");
		proclaim.notOk(text1.isSameNode(null), "with null other node");
	});


	if ((function () {
		try {
			document.createComment("data").constructor; // can throw with "Invalid Pointer"
			return true;
		} catch (_) {
			return false;
		}
	})()) {
		it('comments should be compared on reference', function () {
			var comment1 = document.createComment("data");
			var comment2 = document.createComment("data");

			proclaim.ok(comment1.isSameNode(comment1), "self-comparison");
			proclaim.notOk(comment1.isSameNode(comment2), "same properties");
			proclaim.notOk(comment1.isSameNode(null), "with null other node");
		});
	}

	it('document fragments should be compared on reference - createDocumentFragment',function() {
		var documentFragment1 = document.createDocumentFragment();
		var documentFragment2 = document.createDocumentFragment();

		proclaim.ok(documentFragment1.isSameNode(documentFragment1), "self-comparison");
		proclaim.notOk(documentFragment1.isSameNode(documentFragment2), "same properties");
		proclaim.notOk(documentFragment1.isSameNode(null), "with null other node");
	});

	it('document fragments should be compared on reference - new DocumentFragment',function() {
		var documentFragment1 = new DocumentFragment();
		var documentFragment2 = new DocumentFragment();

		proclaim.ok(documentFragment1.isSameNode(documentFragment1), "self-comparison");
		proclaim.notOk(documentFragment1.isSameNode(documentFragment2), "same properties");
		proclaim.notOk(documentFragment1.isSameNode(null), "with null other node");
	});

	if ('createDocument' in document.implementation) { // IE 8 has no support for "document.implementation.createDocument"
		it('documents should be compared on reference', function () {
			var document1 = document.implementation.createDocument("", "");
			var document2 = document.implementation.createDocument("", "");

			proclaim.ok(document1.isSameNode(document1), "self-comparison");
			proclaim.notOk(document1.isSameNode(document2), "another empty XML document");
			proclaim.notOk(document1.isSameNode(null), "with null other node");
		});
	}

	it('attributes should be compared on reference',function() {
		var attr1 = document.createAttribute('href');
		var attr2 = document.createAttribute('href');

		proclaim.ok(attr1.isSameNode(attr1), "self-comparison");
		proclaim.notOk(attr1.isSameNode(attr2), "same name");
		proclaim.notOk(attr1.isSameNode(null), "with null other node");
	});
});
