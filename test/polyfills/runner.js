"use strict";

const polyfillTestServer = require("./polyfill-test-server");
const browserstackRunner = require("browserstack-runner");
const browserstack = require("browserstack-local");

if (!process.env.BROWSERSTACK_USERNAME || !process.env.BROWSERSTACK_ACCESS_KEY) {
  console.error('To run tests on BrowserStack you need to set the environment variables BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY')
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

polyfillTestServer.listen(9876, () => {
  console.log("Polyfill test server listening on port 9876");

  const config = {
    username,
    key,
    test_path: ["?features=Array.from&includePolyfill"],
    test_server: "http://localhost:9876",
    test_framework: "mocha",
    browsers: [
      {
        "browserstack.tunnel": true,
        startTunnel: true,
        browser: "ie",
        browser_version: "11.0",
        os: "Windows",
        os_version: "7",
        cli_key: 8
      }
    ]
  };

  // starts the Local instance with the required arguments
  browserstackLocal.start(browserstackLocalConfig, function() {
    console.log("Started BrowserStackLocal");
    browserstackRunner.run(config, function(error, report) {
      if (error) {
        console.log("Error:" + error);
        process.exitCode = 1;
      } else {
        console.log(JSON.stringify(report, null, 2));
        console.log("Test Finished");
      }
      browserstackLocal.stop(function() {
        console.log("Stopped BrowserStackLocal");
      });
    });
  });
});

// Calling unref() on a server will allow the program to exit if this is the only active server in the event system.
polyfillTestServer.unref();
