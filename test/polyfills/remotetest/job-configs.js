"use strict";

const useragentToBrowserObject = require('./browser-objects');
const browsers = require('./browsers');

console.log({ browsers });

const jobConfigs = browsers.flatMap(browser => {
	const configs = [];
	const baseConfig = {
		browser: browser,
		shard: false,
		capability: useragentToBrowserObject(browser),
	};

	configs.push({
		...baseConfig,
		polyfillCombinations: false,
	});

	if (browser === 'ie/8.0' || browser === 'ie/9.0') {
		configs.push({
			...baseConfig,
			polyfillCombinations: true,
			shard: 1,
		});

		configs.push({
			...baseConfig,
			polyfillCombinations: true,
			shard: 2,
		});
	} else {
		configs.push({
			...baseConfig,
			polyfillCombinations: true,
		});
	}
	
	return configs;
});

module.exports = jobConfigs;
