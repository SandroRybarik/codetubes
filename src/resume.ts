import path from "path"
import fs from "fs/promises"
import { storeGeneratorToDisk, wrapWithGenerator } from "./codegen"
import { executor } from "./executor"
import process from "process"
import { readFileSync } from "fs"

function loadFileFromCli(): string {
	const [filePath] = process.argv.slice(2)
	return readFileSync(filePath).toString('utf8')
}

async function resume() {
	const jsCodeToRun = loadFileFromCli()
	const executionState = (await fs.readFile(path.join(__dirname, '..', 'codegen', 'es.json'))).toString()
	const userState = (await fs.readFile(path.join(__dirname, '..', 'codegen', 'us.json'))).toString()
	const executionStateParsed: { pc: number } = JSON.parse(executionState)
	const { mainFileSource, numberOfSteps }  = wrapWithGenerator(jsCodeToRun, executionStateParsed.pc)
	const outputPath = await storeGeneratorToDisk(mainFileSource)
	await executor(path.join(__dirname, '..', outputPath), numberOfSteps, executionStateParsed, JSON.parse(userState))
}

resume()