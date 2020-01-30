"use strict";

const http = require("http");
const fs = require("fs");
const mochaCssPath = require.resolve("mocha/mocha.css");
const mochaCss = fs.readFileSync(mochaCssPath, "utf-8");
const mochaJsPath = require.resolve("mocha/mocha.js");
const mochaJs = fs.readFileSync(mochaJsPath, "utf-8");
const proclaimJsPath = require.resolve("proclaim");
const proclaimJs = fs.readFileSync(proclaimJsPath, "utf-8");
const path = require("path");
const polyfillLibrary = require("../../");
const streamFromString = require("from2-string");
const mergeStream = require("merge2");

function createPolyfillLibraryConfigFor(features) {
  return features.split(",").reduce((config, feature) => {
    return Object.assign(config, {
      [feature]: {
        flags: new Set(['always'])
      }
    });
  }, {});
}

// TODO: Make the root path contain a collection of links which run the tests for a specific feature
// TODO: Have a toggle on the test pages to enable/disable the polyfill
// TODO: Have a toggle on the test pages to load the polyfill with the `always` flag
const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  if (url.pathname.startsWith("/favicon.ico")) {
    response.writeHead(404);
    response.end();
    return;
  }
  const featureToTest = url.searchParams.get("features");
  if (!featureToTest) {
    response.writeHead(404);
    response.end();
    return;
  }
  try {
    // TODO: deal with aliases and multiple features to test
    const polyfillMeta = await polyfillLibrary.describePolyfill(featureToTest);
    if (!polyfillMeta) {
      response.writeHead(404);
      response.write(`No polyfill called "${featureToTest}" exists within polyfill-library.`);
      response.end();
    } else if (!polyfillMeta.hasTests) {
      response.writeHead(404);
      response.write(`No tests for "${featureToTest}" exist within polyfill-library.`);
      response.end();
    } else {
      const tests = fs.readFileSync(
        path.join(
          __dirname,
          `../../polyfills/${featureToTest.replace(/\./g, "/")}/tests.js`
        ),
        "utf-8"
      );
      const shoudlWeLoadPolyfill = url.searchParams.has("includePolyfill");
      let polyfill = streamFromString(
        "// Not loading polyfill\n//to load the polyfill add `includePolyfill` to the querystring"
      );
      if (shoudlWeLoadPolyfill) {
        const params = {
          features: createPolyfillLibraryConfigFor(featureToTest),
          minify: false,
          stream: true,
          uaString: request.headers["user-agent"]
        };

        polyfill = polyfillLibrary.getPolyfillString(params);
      }
      const output = mergeStream();

      output.add(
        streamFromString(`<!doctype html>
          <html>
              <head>
                  <meta charset="utf-8">
                  <style>${mochaCss}</style>
                  <script type="text/javascript">${mochaJs}</script>
                  <script type="text/javascript">${proclaimJs}</script>
              </head>
              <body>
                  <div id="mocha"></div>
                  <script type="text/javascript">
                      mocha.setup('bdd');
                      window.onload = function () { mocha.run(); };
                  </script>`)
      );
      output.add(streamFromString('<script type="text/javascript" >'));
      output.add(polyfill);
      output.add(streamFromString("</script>"));
      output.add(
        streamFromString(`<script type="text/javascript">${tests}</script>
              </body>
          </html>`)
      );
      response.setHeader("Content-Type", "text/html");
      response.writeHead(200);
      response.flushHeaders();
      output.pipe(response);
    }
  } catch (e) {
    console.error(e);
    response.writeHead(404);
    response.end();
  }
});

module.exports = server;
