const fs = require('fs/promises')
const { sh, py } = require('../src/sh')

const myRandomFunction = () => {
	return 1*10;
}

async function main($state) {
	$state.file = (await fs.readFile('./package.json')).toString('utf8')
	$state.q = 1
	// throw new Error('emulating failure')
	$state.k = 2
	$state.lol = myRandomFunction();
	sh`touch testfile.test`
	sh`git | wc -l > testfile.test`
	py`print('hello world from python')`
}
