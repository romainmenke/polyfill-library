"use strict";

const fs = require("fs-extra");
const path = require("path");

const { difference, flattenDeep, intersection } = require("lodash");
const _ = require('lodash');
// const file = path.join(__dirname, "./results.json");
const compatFile = path.join(__dirname, "./compat.json");
const TOML = require("@iarna/toml");
const browsers = TOML.parse(
  fs.readFileSync(path.join(__dirname, "./browsers.toml"), "utf-8")
).browsers;

function buildData(builtCompatTable, browserName, version, feature, support) {
	if (!builtCompatTable[feature]) {
		builtCompatTable[feature] = {};
	}

	if (!builtCompatTable[feature][browserName]) {
		builtCompatTable[feature][browserName] = {};
	}

	builtCompatTable[feature][browserName][version] = support;
}

async function main() {
	// Ensure test results file exists before proceeding.
	// if (!fs.existsSync(file)) {
	// 	throw new Error("Test results file does not exists, to create the file you need to run the command: `npm run generate-compat-data`.");
    // }
    
    const testsWithoutPolyfills = require('./results-control.json');
    const testsWithPolyfills = require('./results-all.json');   
    const compat = _.merge(testsWithPolyfills, testsWithoutPolyfills);

	// const compat = await fs.readJSON(file);
	const builtCompatTable = {};

	// Ensure all browsers in the test results file are contained within the browsers.json file.
	// This is to make sure we are not including test-results from browsers we no longer test against.
	const testedBrowsers = flattenDeep(
		Object.entries(compat).map(([name, versionResults]) => {
			return Object.keys(versionResults).map(version => `${name}/${version}`);
		})
	);

	if (!testedBrowsers.every(browser => browsers.includes(browser))) {
		throw new Error(
			"Some browsers in the tests results file are not being tested by BrowserStack. Run the command `npm run update-browserstack-browsers && npm run generate-compat-data` to update the test results with the correct browsers."
		);
	}

	Object.keys(compat).forEach(browserName => {
		const versions = compat[browserName];
		Object.keys(versions).forEach(version => {
			const testResults = versions[version];
			if (!testResults.all || !testResults.control) {
				throw new Error(`Missing test results for ${browserName}/${version}. Run the command ${"`"}npm run generate-compat-data${"`"} to update the test results.`);
			}

			const allTests = Array.from(testResults.control.testedSuites);
			const failedNative = Array.from(testResults.control.failingSuites);
            const failedPolyfilled = Array.from(testResults.all.failingSuites);
            
			const missing = intersection(failedPolyfilled, failedNative);
			const polyfilled = difference(failedNative, failedPolyfilled);
			const native = difference(allTests, failedNative);

			native.forEach(feature => buildData(builtCompatTable, browserName, version, feature, "native"));
			polyfilled.forEach(feature => buildData(builtCompatTable, browserName, version, feature, "polyfilled"));
			missing.forEach(feature => buildData(builtCompatTable, browserName, version, feature, "missing"));
		});
	});

	await fs.outputJSON(compatFile, builtCompatTable, { spaces: 2 });
	console.log("Updated compat.json");
}

main();
