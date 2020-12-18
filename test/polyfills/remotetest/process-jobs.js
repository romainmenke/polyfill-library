"use strict";

const promisify = require("util").promisify;
const _ = require("lodash");
const normalizeUserAgent = require('../../../lib').normalizeUserAgent;
const Tunnel = require("browserstack-local").Local;

async function processJobs(jobs, testResults) {
	const failedJobs = [];
	const errors = [];

	const tunnel = new Tunnel();

	const openTunnel = promisify(tunnel.start.bind(tunnel));
	const closeTunnel = promisify(tunnel.stop.bind(tunnel));

	try {
		await openTunnel({
			verbose: "true",
			force: "true",
			onlyAutomate: "true",
			forceLocal: "true"
		});
	} catch (error) {
		closeTunnel();

		return {
			errors: errors.concat(error),
			testResults: testResults,
			jobs: jobs,
			failedJobs: jobs,
		};
	}

	try {
		// Run jobs within concurrency limits
		await new Promise((resolve) => {
			const results = [];
			let resolvedCount = 0;

			function pushJob() {
				const job = jobs[results.length];
				results.push(
					job
						.run()
						.then(job => {
							if (job.state === "complete") {
								const [family, version] = normalizeUserAgent(job.useragent).split("/");
								_.set(
									testResults,
									[family, version, job.mode],
									job.getResultSummary()
								);

								if (job.getResultSummary().failed) {
									failedJobs.push(job);
								}
							}

							resolvedCount++;
							if (results.length < jobs.length) {
								pushJob();
								return;
							}
							
							if (resolvedCount === jobs.length) {
								resolve();
								return;
							}
						})
						.catch(error => {
							errors.push(error);
							failedJobs.push(job);
						})
				);
			}

			const concurrency = 5;
			for (let index = 0; index < concurrency && index < jobs.length; index++) {
				pushJob();
			}
		});

		await closeTunnel();
		console.log("Tunnel closed");

		return {
			errors: errors,
			testResults: testResults,
			jobs: jobs,
			failedJobs: failedJobs,
		}
	} catch (error) {
		return {
			errors: errors.concat(error),
			testResults: testResults,
			jobs: jobs,
			failedJobs: failedJobs,
		};
	}
}

module.exports = processJobs;
