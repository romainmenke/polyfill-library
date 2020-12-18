"use strict";

const path = require("path");
const fs = require("fs-extra");
const normalizeUserAgent = require('../../../lib').normalizeUserAgent;

// Grab all the browsers from BrowserStack which are officially supported by the polyfil service.
const TOML = require("@iarna/toml");
const browserlist = TOML.parse(
  fs.readFileSync(path.join(__dirname, "../browsers.toml"), "utf-8")
).browsers;

const browser = (process.argv
	.find(a => {
		return a.startsWith("browser=");
	}) || "")
	.replace("browser=", "");

const browsers = browserlist
	.filter(b => {
		return browser ? b.startsWith(browser) : true;
	})
	.filter(uaString => {
		if (uaString.startsWith("ios/")) {
			uaString = uaString.replace("ios", "ios_saf");
		}
	return normalizeUserAgent(uaString) !== "other/0.0.0";
	});

module.exports = browsers;
