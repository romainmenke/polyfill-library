const { exec } = require('child_process');

const currentBranch = process.env.GITHUB_REF || 'HEAD'
const baseBranch = 'master'; //'origin/master';

exec(`git --no-pager diff --name-only ${currentBranch} $(git merge-base ${currentBranch} ${baseBranch})`, (error, stdout, stderr) => {
	if (error) {
		console.log(`error: ${error.message}`);
		return;
	}
	if (stderr) {
		console.log(`stderr: ${stderr}`);
		return;
	}
	console.log(`stdout: ${stdout}`);
});
