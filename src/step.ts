import path from "path"
import fs from "fs/promises"
import { storeGeneratorToDisk, wrapWithGenerator } from "./codegen"
import { Executor } from "./executor"
import process from "process"
import { readFileSync } from "fs"

function loadFileFromCli(): string {
	const [filePath] = process.argv.slice(2)
	return readFileSync(filePath).toString('utf8')
}

async function step(pipelineId: number | undefined = undefined) {
	const jsCodeToRun = loadFileFromCli()

	let executionStateParsed = { pc: 0 }
	let userStateParsed = {}
	try {
		const executionState = (await fs.readFile(path.join(__dirname, '..', 'codegen', 'es.json'))).toString()
		const userState = (await fs.readFile(path.join(__dirname, '..', 'codegen', 'us.json'))).toString()
		executionStateParsed = JSON.parse(executionState)
		userStateParsed = JSON.parse(userState)
	} catch (e) {}

	const { mainFileSource, numberOfSteps }  = wrapWithGenerator(jsCodeToRun, executionStateParsed.pc)
	const outputPath = await storeGeneratorToDisk(mainFileSource)

	const executor = new Executor({
		generatorFilePath: path.join(__dirname, '..', outputPath),
		numberOfSteps: numberOfSteps,
		initialExecutionState: executionStateParsed,
		initialUserState: userStateParsed,
		justOneStep: true,
		afterStepHook: () => {
			// To show progress...
			// fetch('/pipeline/${pipelineId}/step', { method: 'POST' })
		}
	})

	await executor.execute();
}

step()