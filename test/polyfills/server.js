"use strict";

require("hard-rejection/register");
const semver = require("semver");
const polyfillio = require('../../lib');
const fs = require("fs");
const promisify = require("util").promisify;
const readFile = promisify(fs.readFile);
const path = require("path");
const handlebars = require("handlebars");

const directorTemplate = handlebars.compile(
  fs.readFileSync(path.join(__dirname, "./test-director.handlebars"), {
    encoding: "UTF-8"
  })
);
const runnerTemplate = handlebars.compile(
  fs.readFileSync(path.join(__dirname, "./test-runner.handlebars"), {
    encoding: "UTF-8"
  })
);
const runnerDetectsTemplate = handlebars.compile(
  fs.readFileSync(path.join(__dirname, "./test-detects-runner.handlebars"), {
    encoding: "UTF-8"
  })
);

function createPolyfillLibraryConfigFor(features, always) {
  return features.split(",").reduce((config, feature) => {
    return Object.assign(config, {
      [feature]: {
        flags: new Set(always ? ["always", "gated"] : [])
      }
    });
  }, {});
}

const express = require("express");

const app = express();
const port = 9876;
const apicache = require('apicache');
const cache = apicache.middleware;

const cacheFor1Day = cache("1 day", () => true, {
  appendKey: request => {
    let key =
      request.query.feature +
      request.query.includePolyfills +
      request.query.always;
    if (request.query.always === "no") {
      const ua = request.get("User-Agent");
      key += polyfillio.normalizeUserAgent(ua);
    }
    return key;
  }
});

app.get(["/test"], createEndpoint(runnerTemplate));
app.get(["/test-detects"], createEndpoint(runnerDetectsTemplate));
app.get(["/"], createEndpoint(directorTemplate));
app.get("/mocha.js", cacheFor1Day,(request, response) => {
  response.sendFile(require.resolve("mocha/mocha.js"));
});
app.get("/mocha.css", cacheFor1Day, (request, response) => {
  response.sendFile(require.resolve("mocha/mocha.css"));
});
app.get("/proclaim.js", cacheFor1Day, (request, response) => {
  response.sendFile(require.resolve("proclaim/lib/proclaim.js"), "utf-8");
});

app.get(
  "/polyfill.js",
  cacheFor1Day,
  async (request, response) => {
    const ua = request.get("User-Agent");
    const isIE8 = polyfillio.normalizeUserAgent(ua) === "ie/8.0.0";
    const feature = request.query.feature || "";
    const includePolyfills = request.query.includePolyfills || "no";
    const always = request.query.always || "no";

    const headers = {
      "Content-Type": "text/javascript; charset=utf-8"
    };
    response.status(200);
    response.set(headers);

    if (includePolyfills === "yes") {
      const polyfillsWithTests = await testablePolyfills(isIE8);
      const features = polyfillsWithTests.map(polyfill => polyfill.feature);
      const parameters = {
        features: createPolyfillLibraryConfigFor(
          feature ? feature : features.join(","),
          always === "yes"
        ),
        minify: false,
        stream: false,
        uaString: always === "yes" ? "other/0.0.0" : request.get("user-agent")
      };
      const bundle = await polyfillio.getPolyfillString(parameters);
      response.send(bundle);
    } else {
      response.send("");
    }
  }
);

app.get(
  "/tests.js",
  cacheFor1Day,
  async (request, response) => {
    const ua = request.get("User-Agent");
    const isIE8 = polyfillio.normalizeUserAgent(ua) === "ie/8.0.0";
    const feature = request.query.feature;
    const requestedFeature = request.query.feature !== undefined;

    const headers = {
      "Content-Type": "text/javascript; charset=utf-8"
    };
    response.status(200);
    response.set(headers);

    const polyfills = await testablePolyfills(isIE8);

    // Filter for querystring args
    const features = requestedFeature
      ? polyfills.filter(polyfill => feature && feature.split(',').includes(polyfill.feature))
      : polyfills;
    const testSuite = features.map(feature => feature.testSuite).join("\n");

    response.send(testSuite);
  }
);

app.get(
  "/test-detects.js",
  cacheFor1Day,
  async (request, response) => {
    const ua = request.get("User-Agent");
    const isIE8 = polyfillio.normalizeUserAgent(ua) === "ie/8.0.0";

    const headers = {
      "Content-Type": "text/javascript; charset=utf-8"
    };
    response.status(200);
    response.set(headers);

    const polyfills = await testablePolyfills(isIE8, polyfillio.normalizeUserAgent(ua));
    const testDetect = polyfills.filter((polyfill) => {
      // "console" has too many quirks in IE to have a reliable detect without false positives/negatives
      if (polyfill.feature.indexOf('console') === 0) {
        return false;
      }

      // "Array.prototype.sort" detect tries to check for stable sorting which has too many browser quirks.
      if (polyfill.feature === 'Array.prototype.sort') {
        return false;
      }

      // "document.querySelector" unsure if there was a quirk or if the config is outdated. skipping test for now.
      if (polyfill.feature === 'document.querySelector') {
        return false;
      }

      return true;
    }).map(feature => feature.testDetect).join("\n");

    response.send(testDetect);
  }
);

app.listen(port, () => console.log(`Test server listening on port ${port}!`));

const testablePolyfillsCache = {};
async function testablePolyfills(isIE8, ua) {
  if (testablePolyfillsCache[`isIE8:${isIE8};ua:${ua}`]) {
    return testablePolyfillsCache[`isIE8:${isIE8};ua:${ua}`];
  }

  const polyfills = await polyfillio.listAllPolyfills();
  const polyfilldata = [];

  for (const polyfill of polyfills) {
    const config = await polyfillio.describePolyfill(polyfill);
    if (config && config.isTestable && config.isPublic && config.hasTests) {
      if (isIE8 && !semver.satisfies("8.0.0", config.browsers.ie)) {
        continue;
      }
      if (ua) {
        const [family, version] = ua.split('/');
        if (config.browsers[family] && !semver.satisfies(version, config.browsers[family])){
          continue;
        }
        if (!config.browsers[family]) {
          continue;
        }
      }
    }
    if (config && config.isTestable && config.isPublic && config.hasTests) {
      const baseDirectory = path.resolve(__dirname, "../../polyfills");
      const testFile = path.join(baseDirectory, config.baseDir, "/tests.js");
      const testSuite = `describe('${polyfill}', function() {
        it('passes the feature detect', function() {
          proclaim.ok((function() {
            return (${config.detectSource});
          }).call(window));
        });

        it('does not have an uncalled IIFE as detect', function() {
          proclaim["throws"](function () {
            (${config.detectSource})();
          });
        });

        ${await readFile(testFile)}
      });`;

      const testDetect = `describe('${polyfill}', function() {
        it('fails the feature detect without polyfill', function() {
          proclaim.ok((function() {
            return !(${config.detectSource});
          }).call(window));
        });

        it('does not have an uncalled IIFE as detect', function() {
          proclaim["throws"](function () {
            (${config.detectSource})();
          });
        });
      });`;

      polyfilldata.push({
        feature: polyfill,
        testSuite: testSuite,
        testDetect: testDetect,
      });
    }
  }

  polyfilldata.sort(function(a, b) {
    return a.feature > b.feature ? -1 : 1;
  });

  testablePolyfillsCache[`isIE8:${isIE8};ua:${ua}`] = polyfilldata;
  return polyfilldata;
}

function createEndpoint(template) {
  return async (request, response) => {
    const ua = request.get("User-Agent");
    const isIE8 = polyfillio.normalizeUserAgent(ua) === "ie/8.0.0";
    const feature = request.query.feature || "";
    const includePolyfills = request.query.includePolyfills || "no";
    const always = request.query.always || "no";

    if (includePolyfills !== "yes" && includePolyfills !== "no") {
      response.status(400);
      response.send(
        "includePolyfills query parameter is an invalid value, it can only be 'yes' or 'no'."
      );
      return;
    }
    
    if (always !== "yes" && always !== "no") {
      response.status(400);
      response.send(
        "always query parameter is an invalid value, it can only be 'yes' or 'no'."
      );
      return;
    }
    let polyfills;
    if (includePolyfills === 'yes' && always === 'no') {
      polyfills = await testablePolyfills(isIE8, polyfillio.normalizeUserAgent(ua));
    } else {
      polyfills = await testablePolyfills(isIE8);
    }

    // Filter for querystring args
    const features = feature
      ? polyfills.filter(polyfill => feature === polyfill.feature)
      : polyfills;
    response.status(200);

    response.set({
      "Content-Type": "text/html; charset=utf-8"
    });

    response.send(
      template({
        requestedFeature: !!feature,
        features: features.map(f => f.feature).join(','),
        includePolyfills: includePolyfills,
        always: always,
        afterTestSuite: `
        // During the test run, surface the test results in Browserstacks' preferred format
        function run() {
          // Given a test, get the first level suite that it is contained within
          // Not the top level, the first one down.
          function getFirstLevelSuite(test) {
            var parent = test;
            while (parent && parent.parent && parent.parent.parent) {
              parent = parent.parent;
            }
            return parent.title;
          }
          var runner = mocha.run();
          var results = {
            state: 'complete',
            passed: 0,
            failed: 0,
            total: 0,
            duration: 0,
            tests: [],
            failingSuites: {},
            testedSuites: [],
            uaString: window.navigator.userAgent || 'unknown'
          };
          runner.on('pass', function(test) {
            results.passed++;
            results.total++;
          });
          runner.on('fail', function(test, err) {
            // Get a set of all the suites with failing tests in them.
            if (test.parent) {
              results.failingSuites[getFirstLevelSuite(test)] = true;
            }
            results.failed++;
            results.total++;
            results.tests.push({
              name: test.fullTitle(),
              result: false,
              message: err.message,
              stack: err.stack,
              failingSuite: getFirstLevelSuite(test)
            });
          });
          runner.on('suite', function(suite) {
            results.testedSuites.push(getFirstLevelSuite(suite));
          });
          runner.on('end', function() {
            window.global_test_results = results;
            if (parent && parent.receiveTestResults) {
              var flist = ["${feature}"];
              parent.receiveTestResults(flist, results);
            }
          });
        }
        run();`
      })
    );
  };
}
