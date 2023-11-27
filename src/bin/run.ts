import path from "path"
import { storeGeneratorToDisk, wrapWithGenerator } from "../codegen"
import { Executor } from "../executor"
import { loadFileFromCli } from "../lib"

async function run() {
	const jsCodeToRun = loadFileFromCli()
	const { mainFileSource } = wrapWithGenerator(jsCodeToRun)
	const outputPath = await storeGeneratorToDisk(mainFileSource)

	const executor = new Executor({
		generatorFilePath: outputPath,
		initialExecutionState: { pc: 0 },
		initialUserState: {}
	})

	await executor.setup()
	await executor.execute()
}

run()