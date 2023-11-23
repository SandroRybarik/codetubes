const { execSync } = require("child_process");

// example usage: sh`echo 'hello'`
export function sh(cmd) {
	return execSync(`bash -c "${cmd}"`);
}

export function py(cmd) {
	return execSync(`python3 -c "${cmd}"`)
}

module.exports = {
	sh,
	py,
}