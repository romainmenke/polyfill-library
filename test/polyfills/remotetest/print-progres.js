"use strict";

const cli = require("cli-color");

const printProgress = (function () {
	let previousPrint;
	return (jobs) => {
		const out = ["-".repeat(80)];
		let readyCount = 0;
		jobs.forEach(job => {
			let message = "";
			switch (job.state) {
				case "complete": {
					if (job.results.failed) {
						message = cli.red(
							`✘ ${job.results.total} tests, ${job.results.failed} failures`
						);
					} else {
						message = cli.green(`✓ ${job.results.total} tests`);
					}
					message += `  ${job.duration} seconds to complete`;
					break;
				}
				case "error": {
					message = cli.red(`⚠️  ${job.results}`);
					break;
				}
				case "ready": {
					readyCount += 1;
					break;
				}
				case "running": {
					message =
						job.results.runnerCompletedCount + "/" + job.results.runnerCount;
					if (job.results.failed) {
						message += cli.red("  ✘ " + job.results.failed);
					}
					const timeWaiting = Math.floor(
						(Date.now() - job.lastUpdateTime) / 1000
					);
					if (timeWaiting > 5) {
						message += cli.yellow("  🕒  " + timeWaiting + "s");
					}
					break;
				}
				default: {
					message = job.state;
					const timeWaiting = Math.floor(
						(Date.now() - job.lastUpdateTime) / 1000
					);
					if (timeWaiting > 5) {
						message += cli.yellow("  🕒  " + timeWaiting + "s");
					}
				}
			}
			if (message) {
				out.push(
					` • Browser: ${job.name.padEnd(
						" ",
						20
					)} Test config: ${job.configForLog} ${message}`
				);
			}
		});
		if (readyCount) {
			out.push(" + " + readyCount + " job(s) queued");
		}
		const print = out.join("\n") + "\n";
		if (previousPrint !== print) {
			process.stdout.write(print);
		}
		previousPrint = print;
	};
}());

module.exports = printProgress;
