"use strict";

const cli = require("cli-color");

function validateResults(url, jobs) {
	const totalFailureCount = jobs.reduce( // eslint-disable-line unicorn/no-reduce
		(out, job) => out + (job.state === "complete" ? job.results.failed : 1),
		0
	);
	
	if (totalFailureCount) {
		console.log(cli.bold.white("\nFailures:"));
		jobs.forEach(job => {
			if (job.results && job.results.tests) {
				job.results.tests.forEach(test => {
					console.log(" - " + job.name + ":");
					console.log("    -> " + test.name);
					console.log(
						"       " +
						url.replace("http://bs-local.com:9876/", "http://bs-local.com:9876/test") +
						"&feature=" +
						test.failingSuite
					);
					console.log("       " + test.message);
				});
			} else if (job.state !== "complete") {
				console.log(
					" • " +
					job.name +
					" (" +
					job.mode +
					"): " +
					cli.red(job.results || "No results")
				);
			}
		});
		console.log("");
		throw new Error("Failures detected");
	}
}

module.exports = validateResults;
