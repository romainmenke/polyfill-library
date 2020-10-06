'use strict';

const path = require('path');

const Polyfill = require('./polyfill');

async function handleList(options) {
	const source = options.source;
	const destination = options.destination;
	const list = options.list;
	const onlyBuildFeature = options.onlyBuildFeature;

	const polyfills = [];

	for (const absolute of list) {
		try {
			const polyfill = new Polyfill(absolute, path.relative(source, absolute))
			if (!polyfill.hasConfigFile) {
				continue;
			}

			await polyfill.loadConfig();

			polyfill.checkLicense();

			if (!onlyBuildFeature || polyfill.name == onlyBuildFeature) {
				polyfill.loadDetect();
				await polyfill.loadSources();
				polyfill.updateConfig();

				await polyfill.writeOutput(destination);
			}

			polyfill.sources = {}; // no need to communicate this back to the parent proc.
			polyfills.push(polyfill);
		} catch (error) {
			throw {
				name: "Parse error",
				message: `Error handling ${path.relative(source, absolute)}`,
				error
			};
		}
	}

	return polyfills;
}

process.on('message', function (message) {
	if (!message.source || !message.destination || !message.list) {
		if (!process.connected) {
			return;
		}

		process.send({
			child: process.pid,
			error: new Error('Invalid message send to child process')
		}, () => {
			process.disconnect();
		});
		return;
	}

	handleList(message).then((polyfills) => {
		if (!process.connected) {
			return;
		}

		process.send({
			child: process.pid,
			result: polyfills
		}, () => {
			process.disconnect();
		});
	}).catch((error) => {
		if (!process.connected) {
			return;
		}

		process.send({
			child: process.pid,
			error: error
		}, () => {
			process.disconnect();
		});
	});
});
