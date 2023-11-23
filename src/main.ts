import path from "path"
import { storeGeneratorToDisk, wrapWithGenerator } from "./codegen"
import { executor } from "./executor"
import process from "process"
import { readFileSync } from "fs"

function loadFileFromCli(): string {
	const [filePath] = process.argv.slice(2)
	return readFileSync(filePath).toString('utf8')
}

async function main() {
	const jsCodeToRun = loadFileFromCli()
	const { mainFileSource, numberOfSteps } = wrapWithGenerator(jsCodeToRun)
	const outputPath = await storeGeneratorToDisk(mainFileSource)
	await executor(path.join('..', outputPath), numberOfSteps)
}

main()