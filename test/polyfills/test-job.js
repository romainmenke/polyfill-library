"use strict";

const wd = require("wd");
const wait = duration => new Promise(resolve => setTimeout(resolve, duration));

if (
  !process.env.BROWSERSTACK_USERNAME ||
  !process.env.BROWSERSTACK_ACCESS_KEY
) {
  throw new Error(
    "BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY must be set in the environment to run tests on BrowserStack.  For more information about how to set this up or for alternative methods of testing, see https://polyfill.io/v2/docs/contributing/testing"
  );
}

module.exports = class TestJob {
  constructor(name, url, mode, capability, sessionName, testBrowserTimeout, pollTick) {
	  this.name = name;
    this.browser = wd.promiseRemote(
      "hub-cloud.browserstack.com",
      80,
      process.env.BROWSERSTACK_USERNAME,
      process.env.BROWSERSTACK_ACCESS_KEY
    );
    this.browser.configureHttp({
      timeout: 180000,
      retries: 3,
      retryDelay: 100
    });
    this.mode = mode;
    this.url = url;
    this.results = null;
    this.lastUpdateTime = 0;
    this.duration = 0;
    // BrowserStack options https://www.browserstack.com/automate/capabilities
    this.capabilities = Object.assign(
      {
        name: sessionName,
        "project": "polyfill-library",
        "browserstack.local": "true",
        "browserstack.video": "true",
        "browserstack.debug": "true",
        timeout: 180000
      },
      capability
    );
    this.testBrowserTimeout = testBrowserTimeout;
    this.pollTick = pollTick;
    this.setState("ready");
  }

  pollForResults() {
    return this.browser
      .safeEval("window.global_test_results || window.global_test_progress")
      .then(browserdata => {
        if (browserdata && browserdata.state === "complete") {
          this.browser.quit();
          this.results = browserdata;
          this.duration = Math.floor((Date.now() - this.startTime) / 1000);
          this.setState("complete");
          return this;
        } else if (
          this.lastUpdateTime &&
          this.lastUpdateTime < Date.now() - this.testBrowserTimeout
        ) {
          throw new Error(`Timed out at "${this.state}" on "${this.name}"`);
        } else {
          if (browserdata && browserdata.state === "running") {
            if (
              !this.results ||
              browserdata.runnerCompletedCount >
                this.results.runnerCompletedCount
            ) {
              this.results = browserdata;
              this.lastUpdateTime = Date.now();
            }
            this.setState("running");
          }

          // Recurse
          return wait(this.pollTick).then(() => this.pollForResults());
        }
      });
  }

  async run() {
    this.lastUpdateTime = 0;
    this.setState("initialising browser");
    this.startTime = Date.now();

    try {
      await this.browser.init(this.capabilities);
      await this.setState("started");
      await this.browser.get(this.url);
      await this.setState("loaded URL");
      await wait(this.pollTick);
      await this.setState("polling for results");
      await this.pollForResults();
      return this;
    } catch (e) {
      await this.browser.quit();
      this.results = e;
      this.setState("error");
      throw e;
    }
  }

  setState(newState) {
    this.state = newState;
    this.lastUpdateTime = Date.now();
  }

  getResultSummary() {
    if (!this.results) throw new Error("Results not available yet");
    return {
      passed: this.results.passed,
      failed: this.results.failed,
      failingTests: this.results.tests,
      failingSuites: this.results.failingSuites
        ? Object.keys(this.results.failingSuites)
        : [],
      testedSuites: Array.from(this.results.testedSuites)
    };
  }
};
