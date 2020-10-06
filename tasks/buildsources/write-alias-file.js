'use strict';

const fs = require('graceful-fs');
const path = require('path');
const {
	promisify
} = require('util');

const writeFile = promisify(fs.writeFile);

module.exports = function writeAliasFile(polyfills, directory) {
	const aliases = {};

	for (const polyfill of polyfills) {
		for (const alias of polyfill.aliases) {
			aliases[alias] = (aliases[alias] || []).concat(polyfill.name);
		}
	}

	return writeFile(path.join(directory, 'aliases.json'), JSON.stringify(aliases));
}
