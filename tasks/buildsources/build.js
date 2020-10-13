'use strict';

const path = require('path');
const makeDirectory = require('mkdirp');
const child_process = require('child_process');

const source = path.join(__dirname, '../../polyfills');
const destination = path.join(source, '__dist');

const Polyfill = require('./polyfill');
const checkDependenciesExist = require('./check-dependencies-exist');
const checkForCircularDependencies = require('./check-for-circular-dependencies');
const flattenPolyfillDirectories = require('./flatten-polyfill-directories');
const writeAliasFile = require('./write-alias-file');

module.exports = function build(feature = undefined) {
	return Promise.resolve()
		.then(async () => {
			await makeDirectory(destination);

			const queues = [];

			const maxProc = Math.max(
				1,
				Math.min(
					require("os").cpus().length,
					process.env["MAXPROCS"] || 9000
				)
			);

			const slicedPolyfillPaths = [];
			const polyfillPaths = flattenPolyfillDirectories(source);

			for (let i = 0; i < maxProc; i++) {
				const start = Math.floor((polyfillPaths.length / maxProc) * i);
				const end = Math.floor((polyfillPaths.length / maxProc) * (i + 1));
				slicedPolyfillPaths.push(polyfillPaths.slice(start, end));
			}

			const children = [];

			for (const slice of slicedPolyfillPaths) {
				queues.push(new Promise((resolve, reject) => {
					const child = child_process.fork(path.join(__dirname, 'load-sources-child-proc'));
					children.push(child);

					child.on('message', function (message) {
						if (message.result) {
							resolve(message.result.map((polyfillData) => {
								return Polyfill.fromJSON(polyfillData);
							}));
						} else {
							reject(message.error);

							for (const c of children) {
								c.kill();
							}
						}
					});

					child.send({
						source: source,
						destination: destination,
						list: slice,
						onlyBuildFeature: feature
					});
				}));
			}

			return Promise.all(queues).then((resolvedQueues) => {
				return [].concat(...resolvedQueues);
			});
		})
		.then(async (polyfills) => {
			await checkForCircularDependencies(polyfills)
				.then(() => checkDependenciesExist(polyfills))
				.then(() => console.log('Waiting for files to be written to disk...'))
				.then(() => writeAliasFile(polyfills, destination))
		})
}
