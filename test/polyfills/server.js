"use strict";

require("hard-rejection/register");

const polyfillio = require("../../lib/index");
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

const express = require("express");
const app = express();
const port = 8080;

app.get(["/test"], createEndpoint(runnerTemplate, polyfillio));
app.get(["/"], createEndpoint(directorTemplate, polyfillio));

app.listen(port, () => console.log(`Test server listening on port ${port}!`));

async function testablePolyfills() {
  const polyfills = await polyfillio.listAllPolyfills();
  const polyfilldata = [];

  for (const polyfill of polyfills) {
    const config = await polyfillio.describePolyfill(polyfill);
    if (config.isTestable && config.isPublic && config.hasTests) {
      const baseDir = path.resolve(__dirname, "../../polyfills");
      const testFile = path.join(baseDir, config.baseDir, "/tests.js");
      const tests = await readFile(testFile);
      polyfilldata.push({
        feature: polyfill,
        detect: config.detectSource ? config.detectSource : false,
        tests
      });
    }
  }

  polyfilldata.sort(function(a, b) {
    return a.feature > b.feature ? -1 : 1;
  });

  return polyfilldata;
}

function createEndpoint(template) {
  return async (request, response) => {
    const feature = request.query.feature || "";
    const mode = request.query.mode || "all";

    if (mode !== "all" && mode !== "control") {
      response.status(400);
      response.send(
        "mode query parameter is an invalid value, it can only be control or all."
      );
      return;
    }

    const polyfills = await testablePolyfills();

    // Filter for querystring args
    const features = feature
      ? polyfills.filter(polyfill => feature === polyfill.feature)
      : polyfills;

    if (features.length === 0) {
      response.status(400);

      response.send(
        "no polyfills match the requested feature in the feature query parameter."
      );
    } else {
      response.status(200);

      response.set({
        "Content-Type": "text/html; charset=utf-8"
      });

      response.send(
        template({
          loadPolyfill: mode !== "control",
          forceAlways: mode !== "targeted",
          features: features,
          mode: mode
        })
      );
    }
  };
}
