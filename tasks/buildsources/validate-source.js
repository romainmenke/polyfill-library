'use strict';

const vm = require('vm');

module.exports = function validateSource(code, label) {
	try {
		new vm.Script(code);
	} catch (error) {
		throw {
			name: "Parse error",
			message: `Error parsing source code for ${label}`,
			error
		};
	}
}
