'use strict';

const fs = require('graceful-fs');
const path = require('path');
const uglify = require('uglify-js');
const makeDirectory = require('mkdirp');
const {
	promisify
} = require('util');
const spdxLicenses = require('spdx-licenses');
const UA = require('@financial-times/polyfill-useragent-normaliser');
const TOML = require('@iarna/toml');

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

const validateSource = require('./validate-source');

module.exports = class Polyfill {
	constructor(absolute, relative) {
		this.path = {
			absolute,
			relative
		};
		this.name = relative.replace(/(\/|\\)/g, '.');
		this.config = {};
		this.sources = {};
	}

	static fromJSON(data) {
		if (!data) {
			return;
		}

		if (!data.path) {
			return;
		}

		const polyfill = new this(data.path.absolute, data.path.relative);

		polyfill.name = data.name;
		polyfill.config = data.config;
		polyfill.sources = data.sources;

		return polyfill;
	}

	get aliases() {
		return ['all'].concat(this.config.aliases || []);
	}

	get dependencies() {
		return this.config.dependencies || [];
	}

	get configPath() {
		return path.join(this.path.absolute, 'config.toml');
	}

	get detectPath() {
		return path.join(this.path.absolute, 'detect.js');
	}

	get sourcePath() {
		return path.join(this.path.absolute, 'polyfill.js');
	}

	get testsPath() {
		return path.join(this.path.absolute, 'tests.js');
	}

	get hasConfigFile() {
		return fs.existsSync(this.configPath);
	}

	updateConfig() {
		this.config.size = this.sources.min.length;
	}

	loadConfig() {
		return readFile(this.configPath)
			.catch(error => {
				throw {
					name: "Invalid config",
					message: `Unable to read config from ${this.configPath}`,
					error
				};
			})
			.then(data => {
				this.config = TOML.parse(data);

				// Each internal polyfill needs to target all supported browsers at all versions.
				if (this.path.relative.startsWith('_')) {
					const supportedBrowsers = Object.keys(UA.getBaselines()).sort((a, b) => a.localeCompare(b));
					if (!supportedBrowsers.every(browser => this.config.browsers[browser] === "*")) {
						const browserSupport = {};
						supportedBrowsers.forEach(browser => browserSupport[browser] = "*");
						throw new Error("Internal polyfill called " + this.name + " is not targeting all supported browsers correctly. It should be: \n" + TOML.stringify(browserSupport));
					}
				}

				this.config.detectSource = '';
				this.config.baseDir = this.path.relative;

				if ('licence' in this.config) {
					throw new Error(`Incorrect spelling of license property in ${this.name}`);
				}

				this.config.hasTests = fs.existsSync(path.join(this.path.absolute, 'tests.js'));
				this.config.isTestable = !('test' in this.config && 'ci' in this.config.test && this.config.test.ci === false);
				this.config.isPublic = this.name.indexOf('_') !== 0;
			});
	}

	checkLicense() {
		if ('license' in this.config) {
			const license = spdxLicenses.spdx(this.config.license);
			if (license) {
				// We allow CC0-1.0 and WTFPL as they are GPL compatible.
				// https://www.gnu.org/licenses/license-list.html#WTFPL
				// https://www.gnu.org/licenses/license-list.en.html#CC0
				if (this.config.license !== 'CC0-1.0' && this.config.license !== 'WTFPL' && !license.OSIApproved) {
					throw new Error(`The license ${this.config.license} (${license.name}) is not OSI approved.`);
				}
			} else {
				throw new Error(`The license ${this.config.license} is not on the SPDX list of licenses ( https://spdx.org/licenses/ ).`);
			}
		}
	}

	loadDetect() {
		if (fs.existsSync(this.detectPath)) {
			this.config.detectSource = fs.readFileSync(this.detectPath, 'utf8').replace(/\s*$/, '') || '';
			this.config.detectSource = this.minifyDetect(this.config.detectSource).min;
			validateSource(`if (${this.config.detectSource}) true;`, `${this.name} feature detect from ${this.detectPath}`);
		}
	}

	loadSources() {
		return readFile(this.sourcePath, 'utf8')
			.catch(error => {
				throw {
					name: "Invalid source",
					message: `Unable to read source from ${this.sourcePath}`,
					error
				};
			})
			.then(raw => this.minifyPolyfill(raw))
			.catch(error => {
				throw {
					message: `Error minifying ${this.name}`,
					error
				};
			})
			.then(this.removeSourceMaps)
			.then(sources => {
				this.sources = sources;
			});
	}

	minifyPolyfill(source) {
		const raw = `\n// ${this.name}\n${source}`;

		if (this.config.build && this.config.build.minify === false) {
			// skipping any validation or minification process since
			// the raw source is supposed to be production ready.
			// Add a line break in case the final line is a comment
			return {
				raw: raw + '\n',
				min: source + '\n'
			};
		} else {
			validateSource(source, `${this.name} from ${this.sourcePath}`);

			const minified = uglify.minify(source, {
				fromString: true,
				compress: {
					screw_ie8: false,
					keep_fnames: true
				},
				mangle: {
					screw_ie8: false
				},
				output: {
					screw_ie8: false,
					beautify: false
				}
			});

			return {
				raw,
				min: minified.code
			};
		}
	}

	minifyDetect(source) {
		const raw = `\n// ${this.name}\n${source}`;

		if (this.config.build && this.config.build.minify === false) {
			// skipping any validation or minification process since
			// the raw source is supposed to be production ready.
			// Add a line break in case the final line is a comment
			return {
				raw: raw + '\n',
				min: source + '\n'
			};
		} else {
			validateSource(source, `${this.name} from ${this.sourcePath}`);

			const minified = uglify.minify(source, {
				fromString: true,
				compress: {
					screw_ie8: false,
					expression: true,
					keep_fnames: true
				},
				mangle: {
					screw_ie8: false
				},
				output: {
					screw_ie8: false,
					beautify: false,
					semicolons: false
				}
			});

			return {
				raw,
				min: minified.code
			};
		}
	}

	removeSourceMaps(source) {
		const re = /^\/\/#\ssourceMappingURL(.+)$/gm;

		return {
			raw: source.raw.replace(re, ''),
			min: source.min.replace(re, '')
		};
	}

	writeOutput(root) {
		const destination = path.join(root, this.name);
		const files = [
			['meta.json', JSON.stringify(this.config)],
			['raw.js', this.sources.raw],
			['min.js', this.sources.min]
		];

		return makeDirectory(destination)
			.then(() => Promise.all(files
				.map(([name, contents]) => [path.join(destination, name), contents])
				.map(([path, contents]) => writeFile(path, contents))));
	}
}
