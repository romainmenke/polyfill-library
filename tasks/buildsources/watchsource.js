'use strict';

const path = require('path');
const child_process = require('child_process');
const fs = require('graceful-fs');

const source = path.join(__dirname, '../../polyfills');

const build = require('./build');

console.log('Doing a full build before starting watcher');

let servers = [];

process.on('exit', function () {
	servers.forEach((serverProc) => {
		serverProc.stdin.pause();
		serverProc.kill();
	});
});


processFeatureAndStartServer().then(() => {
	const feature = process.argv.slice(2)[0];
	console.log(`Watching "${feature}" ...`);
	console.log(`visit : http://bs-local.com:9876/test?includePolyfills=yes&always=no&feature=${feature}`);

	fs.watch(path.join(source, feature), () => {
		processFeatureAndStartServer(feature);
	});
});
	
async function processFeatureAndStartServer(feature = undefined) {
	const startTime = new Date();

	return build(feature)
		.then(() => {
			const endTime = new Date();
			const timeDiff = (endTime - startTime) / 1000;

			if (feature) {
				console.log(`${feature} built successfully after ${Math.round(timeDiff)}s`);
			} else {
				console.log(`Built successfully after ${Math.round(timeDiff)}s`);
			}

			servers.forEach((serverProc) => {
				serverProc.stdin.pause();
				serverProc.kill();
			});

			servers = [];

			const serverProc = child_process.spawn("node", ["./test/polyfills/server.js"], {
				stdio: [undefined, process.stdout, process.stderr],
			});

			serverProc.on("exit", function (code) {
				console.log("server exited with exit code " + code);
			});

			servers.push(serverProc);
		})
		.catch((error) => {
			console.log(error);
			console.log(JSON.stringify(error));
		});
}
