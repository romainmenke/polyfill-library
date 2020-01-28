"use strict";

const polyfillTestServer = require('./polyfill-test-server');
const browserstackRunner = require("browserstack-runner");
const browserstack = require("browserstack-local");

polyfillTestServer.listen(9876, () => {
  console.log("Polyfill test server listening on port 9876");


  const bs_local = new browserstack.Local();
  const bs_local_args = {
    key: "pbqBnRDzKFSqDz8fmYzy",
    verbose: "true",
    force: "true",
    onlyAutomate: "true",
    forceLocal: "true"
  };
  const config = {
    username: "jakechampion2",
    key: "pbqBnRDzKFSqDz8fmYzy",
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
  bs_local.start(bs_local_args, function() {
    console.log("Started BrowserStackLocal");
    browserstackRunner.run(config, function(error, report) {
      if (error) {
        bs_local.stop(function() {
          console.log("Stopped BrowserStackLocal");
        });
        console.log("Error:" + error);
        //   return;
      }
      console.log(JSON.stringify(report, null, 2));
      console.log("Test Finished");
      bs_local.stop(function() {
        console.log("Stopped BrowserStackLocal");
      });
    });
  });
});

// Calling unref() on a server will allow the program to exit if this is the only active server in the event system.
polyfillTestServer.unref();
