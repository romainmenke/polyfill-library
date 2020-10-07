/* eslint-env mocha, browser */
/* global proclaim */

it('exists', function () {
	proclaim.ok("File" in window);
});

it('is a function', function () {
	proclaim.isFunction(File);
});

it('has correct arity', function () {
	proclaim.arity(File, 2);
});

it('has correct name', function () {
	proclaim.hasName(File, 'File');
});

it('is not enumerable', function () {
	proclaim.isNotEnumerable(window, 'File');
});

describe('File.prototype', function () {
	it("has valid constructor", function () {
		proclaim.ok(new File(['a'], 'b.txt'));
	});

	it("implements .name", function () {
		var a = new File([], '');
		proclaim.equal(a.name, '');

		var b = new File([], 'beta');
		proclaim.equal(b.name, 'beta');

		// The name constructor param takes just about anything
		// Make sure we match native behaviour.
		var c = new File([], {});
		proclaim.equal(c.name, '[object Object]');

		var d = new File([], 5);
		proclaim.equal(d.name, '5');

		var eStringer = {};
		eStringer.toString = function () {
			return 'stringer';
		}
		var e = new File([], eStringer);
		proclaim.equal(e.name, 'stringer');
	});

	// Chromium issue : https://bugs.chromium.org/p/chromium/issues/detail?id=1105171
	// Spec debate : https://github.com/w3c/FileAPI/issues/41
	// it("implements .name escaping", function () {
	// 	// 4.1.2 https://w3c.github.io/FileAPI/#file-constructor
	// 	// Let n be a new string of the same size as the fileName argument to the constructor.
	// 	// Copy every character from fileName to n, replacing any "/" character (U+002F SOLIDUS) with a ":" (U+003A COLON).
	// 	var f = new File([], '/alpha//beta/');
	// 	proclaim.equal(f.name, ":alpha::beta:");
	// });

	it("implements .lastModified", function () {
		var a = new File([], '', {
			lastModified: 100
		});
		proclaim.equal(a.lastModified, 100);

		// Hard to get a fixed number without passing an exact value for lastModified
		// Just checking if it is a number
		var b = new File([], 'beta');
		proclaim.equal(typeof b.lastModified, 'number');
	});

	it("implements .slice", function () {
		proclaim.ok((new File(['alpha'], 'b.txt')).slice(1, 2));
	});
});

describe('File : WPT', function () {
	// From WPT : https://github.com/web-platform-tests/wpt/blob/master/FileAPI/file/File-constructor.html

	it("throws without file bits", function () {
		proclaim["throws"](function () {
			new File();
		});
	});

	it("throws without name", function () {
		proclaim["throws"](function () {
			new File([]);
		});
	});

	it("throws on invalid file bits", function () {
		proclaim["throws"](function () {
			new File('hello', 'world.html');
		});

		proclaim["throws"](function () {
			new File(0, 'world.html');
		});

		proclaim["throws"](function () {
			new File(null, 'world.html');
		});
	});

	// Blob polyfill doesn't handle these
	// it("propagates exceptions", function () {
	// 	var to_string_throws = {
	// 		toString: function () {
	// 			throw new Error('expected');
	// 		}
	// 	};
		
	// 	proclaim["throws"](function () {
	// 		new File([to_string_throws], 'name.txt');
	// 	});
	// });

	function test_first_argument(arg1, expectedSize, testName) {
		it("works when first argument is : " + testName, function () {
			var file = new File(arg1, "dummy");
			proclaim.equal(file.name, "dummy");
			proclaim.equal(file.size, expectedSize);
			proclaim.equal(file.type, "");
			proclaim.ok(!!file.lastModified);
		});
	}

	test_first_argument([], 0, "empty fileBits");
	test_first_argument(["bits"], 4, "DOMString fileBits");
	test_first_argument(["𝓽𝓮𝔁𝓽"], 16, "Unicode DOMString fileBits");
	test_first_argument([new String('string object')], 13, "String object fileBits");
	test_first_argument([new Blob()], 0, "Empty Blob fileBits");
	test_first_argument([new Blob(["bits"])], 4, "Blob fileBits");
	test_first_argument([new File([], 'world.txt')], 0, "Empty File fileBits");
	test_first_argument([new File(["bits"], 'world.txt')], 4, "File fileBits");
	test_first_argument(["bits", new Blob(["bits"]), new Blob(), new File(["bits"], 'world.txt')], 12, "Various fileBits");
	
	// IE with native Blob does not support these
	// test_first_argument([12], 2, "Number in fileBits");
	// test_first_argument([
	// 	[1, 2, 3]
	// ], 5, "Array in fileBits");
	// test_first_argument([{}], 15, "Object in fileBits"); // "[object Object]"

	// var to_string_obj = {
	// 	toString: function () {
	// 		return 'a string'
	// 	}
	// };
	// test_first_argument([to_string_obj], 8, "Object with toString in fileBits");
	// IE with native Blob does not support these

	function test_second_argument(arg2, expectedFileName, testName) {
		it("works when second argument is : " + testName, function () {
			var file = new File(["bits"], arg2);
			proclaim.equal(file.name, expectedFileName);
		});
	}

	test_second_argument("dummy", "dummy", "Using fileName");
	test_second_argument("dummy/foo", "dummy/foo", "No replacement when using special character in fileName");
	test_second_argument(null, "null", "Using null fileName");
	test_second_argument(1, "1", "Using number fileName");
	test_second_argument('', '', "Using empty string fileName");

	function test_third_argument(type, expected) {
		it("works when third argument is : " + type, function () {
			var file = new File(["bits"], "dummy", {
				type: type
			});

			proclaim.equal(file.type, expected);
		});
	}

	test_third_argument('text/plain', 'text/plain');
	test_third_argument('nonparsable', 'nonparsable');

	// Blob polyfill doesn't handle these case :
	// test_third_argument('text/plain;charset=UTF-8', 'text/plain;charset=utf-8');
	// test_third_argument('TEXT/PLAIN', 'text/plain');
	// test_third_argument('𝓽𝓮𝔁𝓽/𝔭𝔩𝔞𝔦𝔫', '');
	// test_third_argument('ascii/nonprintable\u001F', '');
	// test_third_argument('ascii/nonprintable\u007F', '');
	// test_third_argument('nonascii\u00EE', '');
	// test_third_argument('nonascii\u1234', '');
});
