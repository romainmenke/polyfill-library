"use strict";

const polyfillTestServer = require("./polyfill-test-server");
const browserstackRunner = require("browserstack-runner");
const browserstack = require("browserstack-local");
const polyfillLibrary = require("../../");
const promisify = require("util").promisify;
const run = promisify(browserstackRunner.run);
const fs = require("fs").promises;
const path = require("path");

if (
  !process.env.BROWSERSTACK_USERNAME ||
  !process.env.BROWSERSTACK_ACCESS_KEY
) {
  console.error(
    "To run tests on BrowserStack you need to set the environment variables BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY"
  );
}

const username = process.env.BROWSERSTACK_USERNAME;
const key = process.env.BROWSERSTACK_ACCESS_KEY;

const browserstackLocal = new browserstack.Local();
const browserstackLocalConfig = {
  key,
  verbose: "true",
  force: "true",
  onlyAutomate: "true",
  forceLocal: "true"
};

const config = {
  timeout: 300,
  username,
  key,
  test_path: ["test.html?features=Array.from&includePolyfill"],
  test_server: "http://localhost:9876",
  test_framework: "mocha",
  build: new Date().toISOString(),
  browsers: [
    {
      "browserstack.tunnel": true,
      startTunnel: true,
      browser: "chrome",
      browser_version: "79.0",
      os: "Windows",
      os_version: "7"
    }
  ]
};

polyfillTestServer.listen(9876, async () => {
  console.log("Polyfill test server listening on port 9876");

  const polyfills = await polyfillLibrary.listAllPolyfills();
  const polyfillsWithTests = [];
  for (const polyfill of polyfills) {
    const meta = await polyfillLibrary.describePolyfill(polyfill);
    if (meta.hasTests) {
      polyfillsWithTests.push(polyfill);
    }
  }

  // config.test_path = testPaths;
  // starts the Local instance with the required arguments
  browserstackLocal.start(browserstackLocalConfig, async function() {
    console.log("Started BrowserStackLocal");
    await fs.writeFile(
      path.join(__dirname, "report-polyfilled.json"),
      "[]",
      "utf-8"
    );
    for (const feature of polyfillsWithTests) {
      config.test_path = `test.html?features=${feature}&includePolyfill`;
      const results = await run(config);
      const report = JSON.parse(
        await fs.readFile(
          path.join(__dirname, "report-polyfilled.json"),
          "utf-8"
        )
      );
      delete results[0].tests;
      const testsPass = results[0].suites.status === 'passed';
      const browser = results[0].browser;
      report.push({
        feature,
        testsPass,
        browser
      });
      await fs.writeFile(
        path.join(__dirname, "report-polyfilled.json"),
        JSON.stringify(report, null, 2),
        "utf-8"
      );
      console.log("Test Finished", feature);
    }
    await fs.writeFile(
      path.join(__dirname, "report-native.json"),
      "[]",
      "utf-8"
    );
    for (const feature of polyfillsWithTests) {
      config.test_path = `test.html?features=${feature}`;
      const results = await run(config);
      const report = JSON.parse(
        await fs.readFile(path.join(__dirname, "report-native.json"), "utf-8")
      );
      delete results[0].tests;
      const testsPass = results[0].suites.status === 'passed';
      const browser = results[0].browser;
      report.push({
        feature,
        testsPass,
        browser
      });
      await fs.writeFile(
        path.join(__dirname, "report-native.json"),
        JSON.stringify(report, null, 2),
        "utf-8"
      );
      console.log("Test Finished", feature);
    }
    browserstackLocal.stop(function() {
      console.log("Stopped BrowserStackLocal");
    });
  });
});

// Calling unref() on a server will allow the program to exit if this is the only active server in the event system.
polyfillTestServer.unref();
