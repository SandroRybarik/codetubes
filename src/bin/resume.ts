import path from "path"
import { storeGeneratorToDisk, wrapWithGenerator } from "../codegen"
import { ExecutionState, Executor, UserState } from "../executor"
import { loadFileFromCli } from "../lib"
import StateManager from "../state_manager"

async function resume() {
	const stateManager = new StateManager({
		dir: path.join(__dirname, '..', '..', 'codegen'),
		fname: 'state',
	})


	const jsCodeToRun = loadFileFromCli()
	const state = await stateManager.load<{ execution: ExecutionState, state: UserState } >()

	// TODO: refactor this
	const { mainFileSource }  = wrapWithGenerator(jsCodeToRun, state.execution.pc)
	const outputPath = await storeGeneratorToDisk(mainFileSource)

	const executor = new Executor({
		generatorFilePath: outputPath,
		initialExecutionState: state.execution,
		initialUserState: state.state,
	})

	await executor.setup()
	await executor.execute()
}

resume()