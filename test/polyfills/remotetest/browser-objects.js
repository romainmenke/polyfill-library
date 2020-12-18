"use strict";

const TOML = require("@iarna/toml");
const path = require("path");
const fs = require("fs-extra");

const browserstacklist = TOML.parse(
  fs.readFileSync(path.join(__dirname, "../browserstackBrowsers.toml"), "utf-8")
).browsers;

function useragentToBrowserObject(browserWithVersion) {
  const [browser, version] = browserWithVersion.split("/");
  for (const browserObject of browserstacklist) {
    if (browser === browserObject.os && version === browserObject.os_version) {
      return {
        deviceName: browserObject.device,
        platformName: browserObject.os,
        platformVersion: browserObject.os_version,
        real_mobile: true,
        'browserstack.appium_version': '1.8.0'
      };
    } else if (
      browser === browserObject.browser &&
      version === browserObject.browser_version
    ) {
      const o = {
        browserName: browserObject.browser,
        browserVersion: browserObject.browser_version, 
      };
      if (o.browserName === 'edge') {
        o["browserstack.selenium_version"] = "3.5.2";
      }
      return o;
    }
  }
  throw new Error(
    `Browser: ${browser} with version ${version} was not found on BrowserStack.`
  );
}

module.exports = useragentToBrowserObject;
