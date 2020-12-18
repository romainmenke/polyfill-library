"use strict";

global.Promise = require("bluebird");
// Enable long stack traces
Promise.config({
	longStackTraces: true
});

// By default, promises fail silently if you don't attach a .catch() handler to them.
//This tool keeps track of unhandled rejections globally. If any remain unhandled at the end of your process, it logs them to STDERR and exits with code 1.
const hardRejection = require("hard-rejection");
// Install the unhandledRejection listeners
hardRejection();

const wait = duration => new Promise(resolve => setTimeout(resolve, duration));

const jobConfigs = require('./job-configs');
const printProgress = require('./print-progres');
const validateResults = require('./validate-results');
const processJobs = require('./process-jobs');

const path = require("path");
const fs = require("fs-extra");
const TestJob = require("../test-job");

const pollTick = 5000;
const testBrowserTimeout = 10 * 60 * 1000;
const mode =
	["all", "control", "targeted"].find(x => process.argv.includes(x)) || "all";
const testResultsFile = path.join(__dirname, `results-${mode}.json`);

const director = process.argv.includes("director");
const always = "always=" + (mode === "all" ? "yes" : "no");

const includePolyfills = "includePolyfills=" +(mode !== "control" ? "yes" : "no");
// https://www.browserstack.com/question/759
const url = `http://bs-local.com:9876/${director ? '' : 'test'}?${includePolyfills}&${always}`;
const tunnelId =
	"build:" +
	(process.env.CIRCLE_BUILD_NUM || process.env.NODE_ENV || "null") +
	"_" +
	new Date().toISOString();

let jobs = [];

jobConfigs.forEach(jobConfig => {
	jobs.push(new TestJob(
		jobConfig.browser,
		url,
		mode,
		jobConfig.capability,
		tunnelId,
		testBrowserTimeout,
		pollTick,
		jobConfig.polyfillCombinations,
		jobConfig.shard
	));
});

const createRetryJob = (jobConfig, url) => {
	return new TestJob(
		jobConfig.browser,
		url,
		mode,
		jobConfig.capability,
		tunnelId,
		testBrowserTimeout,
		pollTick,
		jobConfig.polyfillCombinations,
		jobConfig.shard
	);
};

(async function() {
	try {
		let testResults = {};
		const mainResults = await run(jobs, testResults);
		testResults = mainResults.testResults;
		
		let singleSuiteRetries = generateSingleSuiteRetries(mainResults);
		let fullSuiteRetries = generateFullSuiteRetries(mainResults);

		let singleSuiteResults;
		if (singleSuiteRetries.length > 0) {
			await wait(30  * 1000);
			singleSuiteResults = await run(singleSuiteRetries, {});
		}

		let fullSuiteResults;
		if (
			singleSuiteRetries &&
			singleSuiteRetries.length > 0 &&
			(
				!singleSuiteResults.failingJobs ||
				singleSuiteResults.failingJobs.length == 0
			)
		) {
			await wait(30  * 1000);
			fullSuiteResults = await run(fullSuiteRetries, testResults);
			testResults = fullSuiteResults.testResults;
		}

		await fs.outputJSON(testResultsFile, testResults);

		printProgress(jobs);

		validateResults(url, jobs);
	} catch (error) {
		console.error(error);
		process.exitCode = 1;
		// eslint-disable-next-line unicorn/no-process-exit
		process.exit(1);
	}
}());

async function run(jobs, testResults) {
	const cliFeedbackTimer = setInterval(() => printProgress(jobs), pollTick);

	const results = await processJobs(jobs, testResults);

	results.errors.forEach((error) => {
		console.log(error.stack || error);
	});

	clearTimeout(cliFeedbackTimer);

	printProgress(jobs)

	return results;
}

function generateSingleSuiteRetries(results) {
	const jobsForRetry = [];

	results.failedJobs.forEach((failedJob) => {
		const summary = failedJob.getResultSummary();
		const index = jobs.indexOf(failedJob);

		const jobConfig = {
			...jobConfigs[index]
		};

		if (summary.failingSuites.length > 0) {
			summary.failingSuites.forEach((failingSuite) => {
				console.log(`Retrying ${failedJob.name} : ${failingSuite}`);
				jobsForRetry.push(createRetryJob(jobConfig, url + '&feature=' + failingSuite));
			});
		}
	});

	return jobsForRetry;
}

function generateFullSuiteRetries(results) {
	const jobsForRetry = [];

	results.failedJobs.forEach((failedJob) => {
		const index = jobs.indexOf(failedJob);
		const job = jobs[index];
		job.results = undefined;
		job.lastUpdateTime = 0;
		job.duration = 0;

		jobsForRetry.push(job);
	});

	return jobsForRetry;
}
