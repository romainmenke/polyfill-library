/* eslint-env mocha, browser */
/* global proclaim */

proclaim.arity = function (fn, expected) {
	proclaim.isFunction(fn);
	proclaim.strictEqual(fn.length, expected);
};
proclaim.hasName = function (fn, expected) {
	var functionsHaveNames = (function foo() { }).name === 'foo';
	if (functionsHaveNames) {
		proclaim.strictEqual(fn.name, expected);
	} else {
		proclaim.equal(Function.prototype.toString.call(fn).match(/function\s*([^\s]*)\s*\(/)[1], expected);
	}
};

it("Should create inherited object", function() {
	var parent = { foo: 'bar', obj: {} };
	var child = Object.create(parent);

	proclaim.isTypeOf(child, 'object');
	proclaim.notStrictEqual(parent, child);
	proclaim.equal(child.foo, parent.foo);
	proclaim.equal(child.obj, parent.obj);
});

it("Should create inherited object from a Native Object", function() {
	var parent = document;
	var child = Object.create(parent);

	proclaim.equal(typeof child, 'object');
	proclaim.notStrictEqual(parent, child);
	proclaim.equal(child.window, parent.window);
	proclaim.equal(child.ELEMENT_NODE, parent.ELEMENT_NODE);
});

it("Should throw a TypeError if called with undefined", function() {
	proclaim["throws"](function() { Object.create(undefined); }, TypeError);
});

it("Should create an object if called with null", function() {
	proclaim.equal(typeof Object.create(null), 'object');
});

it("Should throw a TypeError if called with a boolean primitive", function() {
	proclaim["throws"](function() { Object.create(true); }, TypeError);
});

it("Should throw a TypeError if called with a number primitive", function() {
	proclaim["throws"](function() { Object.create(100); }, TypeError);
});

it("Should not throw a TypeError if called with Function objects", function() {
	proclaim.doesNotThrow(function() {
		Object.create(Function);
	});
	proclaim.doesNotThrow(function() {
		Object.create(Function.prototype);
	});
});

it("Should return an instance of Object", function() {
	proclaim.isInstanceOf(Object.create({}), Object);
});

it("Should set the prototype of the passed-in object", function() {
	function Base() {}

	var
	supportsProto = ''.__proto__ === String.prototype,
	b = new Base(),
	bb = Object.create(b);

	proclaim.equal(supportsProto ? bb.__proto__ : bb.constructor.prototype, b);
});
it("Should allow additional properties to be defined", function() {
	function Base() {}

	var
	b = new Base(),
	bb = Object.create(b, {
		x: {
			value: true,
			writable: false
		},
		y: {
			value: "str",
			writable: false
		}
	});

	proclaim.equal(bb.x, true);
	proclaim.equal(bb.y, "str");
	proclaim.equal(b.x, undefined);
	proclaim.equal(b.y, undefined);
});

// http://www.ecma-international.org/ecma-262/5.1/#sec-15.2.3.5
// https://github.com/tc39/test262/blob/master/test/suite/ch15/15.2/15.2.3/15.2.3.5/15.2.3.5-4-100.js
it("If the second argument is present and not undefined, add own properties to result object as if by calling the standard built-in function Object.defineProperties with arguments returned object and Properties.", function() {
	var newObj = Object.create({}, {
		prop: {
			value: "ownDataProperty"
		}
	});

	var result1 = Object.prototype.hasOwnProperty.call(newObj, "prop");

	// Avoid Object.defineProperty's writable test in old IE
	// delete newObj.prop;

	// var result2 = newObj.hasOwnProperty("prop");

	proclaim.equal(result1, true);
	// proclaim.equal(result2, true);
});

describe('Object.create', function () {
	var obj = {
		q: 1
	};

	function has(x, xs){
		var i = -1, l = xs.length >>> 0;
		while (++i < l) if (x === xs[i]) return true;
		return false;
	}

	function isObject(it) {
		return it === Object(it);
	}

	function isPrototype(a, b) {
		return {}.isPrototypeOf.call(a, b);
	}

	function getPropertyNames(object) {
		var result = Object.getOwnPropertyNames(object);
		// eslint-disable-next-line no-cond-assign
		while (object = Object.getPrototypeOf(object)) {
			var i = 0;
			var ref = Object.getOwnPropertyNames(object);
			var len;
			for (len = ref.length; i < len; ++i) {
				var x = ref[i];
				has(x, result) || result.push(x);
			}
		}
		return result;
	}

	it('is a function', function () {
		proclaim.isFunction(Object.create);
	});

	it('has correct arity', function () {
		proclaim.arity(Object.create, 2);
	});

	it('has the correct name', function () {
		proclaim.hasName(Object.create, 'create');
	});

	it('is not enumerable', function () {
		proclaim.isNotEnumerable(Object, 'create');
	});

	it('is prototype', function () {
		proclaim.ok(isPrototype(obj, Object.create(obj)));
	});

	it('creates objects with properties', function () {
		proclaim.ok(Object.create(obj).q === 1);
	});

	it('creates instances with properties', function () {
		function fn() {
			return this.a = 1;
		}

		proclaim.ok(Object.create(new fn).a === 1);
	});

	it('creates functions that are instances of itself', function () {
		function fn() {
			return this.a = 1;
		}

		proclaim.ok(Object.create(new fn) instanceof fn);
	});

	if ('getPrototypeOf' in Object) {
		it.skip('can get the prototype of', function () {
			function fn() {
				return this.a = 1;
			}

			proclaim.ok(fn.prototype === Object.getPrototypeOf(Object.getPrototypeOf(Object.create(new fn))));
		});
	}

	if ('getOwnPropertyNames' in Object && 'getPrototypeOf' in Object) {
		it('can get own property names', function () {
			proclaim.deepEqual(getPropertyNames(Object.create(null)), []);
		});
	}

	it('creates objects following the property descriptor map', function () {
		proclaim.ok(Object.create({}, {
			a: {
				value: 42
			}
		}).a === 42);
	});

	it('creates correct object from property map alone', function () {
		var obj2 = Object.create(null, {
			w: {
				value: 2
			}
		});

		proclaim.ok(isObject(obj2));
		proclaim.ok(!('toString' in obj2));
		proclaim.ok(obj2.w === 2);
	});
});
