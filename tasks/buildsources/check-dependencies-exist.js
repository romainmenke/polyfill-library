'use strict';

module.exports = function checkDependenciesExist(polyfills) {
	for (const polyfill of polyfills) {
		for (const dependency of polyfill.dependencies) {
			if (!polyfills.some(function (polyfill) {
					return dependency === polyfill.name;
				})) {
				return Promise.reject(`Polyfill ${polyfill.name} depends on ${dependency}, which does not exist within the polyfill-service. Recommended to either add the missing polyfill or remove the dependency.`);
			}
		}
	}
	return Promise.resolve();
}
