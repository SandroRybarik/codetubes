import path from "path"
import { storeGeneratorToDisk, wrapWithGenerator } from "../codegen"
import { ExecutionState, Executor, UserState } from "../executor"
import { fileExists, makeGeneratorJs } from "../lib"
import StateManager from "../state_manager"

async function step() {
	const stateManager = new StateManager({
		file: path.join(__dirname, '..', '..', 'codegen', 'state.json'),
	})

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

	// check if generator has been already compiled if not then compile and store to disk
	const pathToGeneratorJs = path.join(__dirname, '..', '..', 'codegen', 'generator.js')
	const wasCompiled = await fileExists(pathToGeneratorJs);

	if (!wasCompiled) {
		await makeGeneratorJs(pathToGeneratorJs)
	}

	const executor = new Executor({
		generatorFilePath: pathToGeneratorJs,
		initialExecutionState: state.execution,
		initialUserState: state.state,
	})

	executor.setAfterStepHook(() => {
		const currentState = executor.states();
		// Store entire state after execution
		stateManager.save({
			state: currentState.user,
			execution: currentState.execution,
		})
	})

	await executor.setup();
	await executor.step();
}

step()
