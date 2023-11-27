import path from "path"
import { storeGeneratorToDisk, wrapWithGenerator } from "../codegen"
import { ExecutionState, Executor, UserState } from "../executor"
import { loadFileFromCli } from "../lib"
import StateManager from "../state_manager"

async function step() {
	const stateManager = new StateManager({
		dir: path.join(__dirname, '..', '..', 'codegen'),
		fname: 'state',
	})

	const jsCodeToRun = loadFileFromCli()

	// We either continue from existing execution or we start from scratch
	let state: { execution: ExecutionState, state: UserState };
	try {
		state = await stateManager.load<{ execution: ExecutionState, state: UserState}>()
	} catch {
		// TODO: do file exist check properly through fs api
		// By default we start from scratch
		state = {
			execution: { pc: 0 },
			state: {},
		}
	}

	const { mainFileSource }  = wrapWithGenerator(jsCodeToRun, state.execution.pc)
	const outputPath = await storeGeneratorToDisk(mainFileSource)

	const executor = new Executor({
		generatorFilePath: outputPath,
		initialExecutionState: state.execution,
		initialUserState: state.state,
	})

	await executor.setup();
	await executor.step();
}

step()