'use strict';

const fs = require('graceful-fs');
const path = require('path');
const {promisify} = require('util');
const glob = promisify(require('glob'));
const TOML = require('@iarna/toml');
const cwd = path.join(__dirname, '../');
const globOptions = { cwd: cwd };

const loadSource = (polyfillPaths) => {
	return polyfillPaths.map((p) => {
		return fs.readFileSync(p);
	}).join('');
};

async function installPolyfill(config) {
	const polyfillOutputFolder = path.dirname(config.src);
	const polyfillOutputPath = path.join(polyfillOutputFolder, 'polyfill.js');
	const polyfillAlreadyExists = fs.existsSync(polyfillOutputPath);
	
	const polyfillSourcePaths = (config.install.paths || ['']).map((p) => {
		return require.resolve(path.join(config.install.module, p));
	});

	const newPolyfill = loadSource(polyfillSourcePaths);
	
	const logPrefix = path.basename(polyfillOutputFolder) + ': ';
	if (polyfillAlreadyExists) {
		const currentPolyfill = fs.readFileSync(polyfillOutputPath, 'utf-8');
		if (newPolyfill === currentPolyfill) {
			console.log(logPrefix + 'No change');
			return;
		}

		console.log(logPrefix + 'Polyfill updated, replacing old version');
		fs.unlinkSync(polyfillOutputPath);
	} else {
		console.log(logPrefix + 'New polyfill');
	}
	
	polyfillSourcePaths.map((p) => {
		console.log('  from ' + path.relative(cwd, p))
	});

	fs.writeFileSync(polyfillOutputPath, newPolyfill);
	
	if (config.install.postinstall) {
		console.log(logPrefix + ' * Running module-specific update task ' + config.install.postinstall);
		require(path.resolve(polyfillOutputFolder, config.install.postinstall));
	}
}

console.log('Updating third-party polyfills...');
glob('polyfills/**/config.toml', globOptions)
	.then(files => {
		const polyfills = [];

		files
			.map(source => {
				try {
					return Object.assign({ src: source }, TOML.parse(fs.readFileSync(source, 'utf-8')));
				} catch (error) {
					throw new Error('Failed on ' + source + '. Error: ' + error);
				}
			})
			.filter(config => 'install' in config)
			.forEach(toml => {
				polyfills.push(installPolyfill(toml))
			});
	
		return Promise.all(polyfills);
	})
	.then(() => console.log('Polyfills updated successfully'))
	.catch(error => {
		console.log(error);
		// eslint-disable-next-line unicorn/no-process-exit
		process.exit(1);
	});
