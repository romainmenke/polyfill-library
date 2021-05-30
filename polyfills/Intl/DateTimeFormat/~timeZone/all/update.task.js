/* eslint-env node */

"use strict";

var fs = require("graceful-fs");
var path = require("path");
const vm = require('vm');

var IntlPolyfillOutput = path.resolve("polyfills/Intl/DateTimeFormat/~timeZone/all/");
var ZonesPolyfillOutput = path.resolve(
	"polyfills/Intl/DateTimeFormat/~timeZone/~zone"
);

var mkdirp = require("mkdirp");
var TOML = require("@iarna/toml");

function extractTimeZoneData() {
	var ctx = {
		result: null,
		require: require,
		console: console
	};

	var sandbox = vm.createContext(ctx);

	var script = new vm.Script(`
		var Intl = {
			DateTimeFormat: {
				__addTZData: function(x) {
					result = x;
				}
			}
		};

		${fs.readFileSync(require.resolve("@formatjs/intl-datetimeformat/add-all-tz.js")).toString()};
	`);
	
  script.runInContext(sandbox, { timeout: 1000 });
	return ctx.result;
}

var allTimeZoneData = extractTimeZoneData();

function writeFileIfChanged(filePath, newFile) {
	if (fs.existsSync(filePath)) {
		var currentFile = fs.readFileSync(filePath);

		if (newFile !== currentFile) {
			fs.writeFileSync(filePath, newFile);
		}
	} else {
		fs.writeFileSync(filePath, newFile);
	}
}

var configSource = TOML.parse(
	fs.readFileSync(path.join(IntlPolyfillOutput, "config.toml"), "utf-8")
);
delete configSource.install;

var testsSource = fs.readFileSync(path.join(IntlPolyfillOutput, "tests.js"), "utf-8");

if (!fs.existsSync(ZonesPolyfillOutput)) {
	mkdirp.sync(ZonesPolyfillOutput);
}

function intlZoneDetectFor(zone) {
	return `(function (global) {
	if ('Intl' in global && 'DateTimeFormat' in global.Intl && 'resolvedOptions' in global.Intl.DateTimeFormat.prototype) {
			try {
				return (new Intl.DateTimeFormat([], {
					timeZone: '${zone}',
					timeZoneName: 'short'
				}).resolvedOptions().timeZone === '${zone}');
			} catch(e) {
				return false;
			}
	}

	return false;
}(self))
`;
}

function polyfillTimeZone(data) {
	return `if ('DateTimeFormat' in Intl && Intl.DateTimeFormat.__addTZData) {
	Intl.DateTimeFormat.__addTZData(${JSON.stringify(data)});
}
`
}

console.log(
	"Importing time zone data polyfill"
);

allTimeZoneData.zones.forEach((zone) => {
	const zoneName = zone.split('|')[0];

	var zoneOutputPath = path.join(ZonesPolyfillOutput, zoneName.replace('/', ''));

	if (!fs.existsSync(zoneOutputPath)) {
		mkdirp.sync(zoneOutputPath);
	}

	var polyfillOutputPath = path.join(zoneOutputPath, "polyfill.js");
	var detectOutputPath = path.join(zoneOutputPath, "detect.js");
	var configOutputPath = path.join(zoneOutputPath, "config.toml");
	var testsOutputPath = path.join(zoneOutputPath, "tests.js");
	writeFileIfChanged(polyfillOutputPath, polyfillTimeZone({
		...allTimeZoneData,
		zones: [zone]
	}));
	writeFileIfChanged(detectOutputPath, intlZoneDetectFor(zoneName));
	writeFileIfChanged(
		configOutputPath,
		TOML.stringify({
			...configSource,
			notes: [],
			aliases: [`Intl.DateTimeFormat.~timeZone.~zone.${zoneName}`],
			test: (zoneName === 'Africa/Accra' ? { ci: true } : { ci: false })
		})
	);

	if (zoneName === 'Africa/Accra') {
		writeFileIfChanged(testsOutputPath, testsSource);
	}
});

console.log("Time zone data imported successfully");
