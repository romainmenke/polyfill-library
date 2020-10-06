'use strict';

const toposort = require('toposort');

module.exports = function checkForCircularDependencies(polyfills) {
	const graph = [];

	for (const polyfill of polyfills) {
		for (const dependency of polyfill.dependencies) {
			graph.push([dependency, polyfill.name]);
		}
	}

	try {
		toposort(graph);

		return Promise.resolve();
	} catch (error) {
		return Promise.reject('\nThere is a circle in the dependency graph.\nCheck the `dependencies` property of polyfill config files that have recently changed, and ensure that they do not form a circle of references.' + error);
	}
}
