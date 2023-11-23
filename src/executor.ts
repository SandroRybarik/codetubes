import path from "path"
import { toJsonDump } from "./disk"


type ExecutorSettings = {
	generatorFilePath: string;
	numberOfSteps: number;
	initialExecutionState: { pc: number };
	initialUserState: Record<string, any>;
	justOneStep: boolean;
	afterStepHook?: () => void
}

export class Executor {
	private settings: ExecutorSettings
	constructor(settings: ExecutorSettings) {
		this.settings = settings;
	}

	async execute() {
		const {
			generatorFilePath,
			initialExecutionState,
			initialUserState,
			numberOfSteps,
			justOneStep,
		} = this.settings

		const { generator } = await import(generatorFilePath) as ({ generator: (state: Record<string, any>) => AsyncGenerator<number, any, any> })
		const executionState = initialExecutionState;
		const userState = initialUserState;
		const gen = generator(userState)

		// We are going to yield each line of code as we go in loop below.
		while(true) {
			// don't continue, we executed everything
			if (executionState.pc + 1 > numberOfSteps) {
				break
			}

			const r = await gen.next()

			if (this.settings.afterStepHook) {
				this.settings.afterStepHook()
			}

			if (r.done) {
				break;
			}

			executionState.pc++

			// serialize state as a single step (us = userState)
			await toJsonDump(userState, 'us')
			// TODO: serialize execution state for ability to resume (es = executionState)
			await toJsonDump(executionState, 'es')

			if (justOneStep) {
				break;
			}
		}
	}
}

// TODO: refactor this into class
// We are passing around way to much params
export async function executor(generatorFilePath: string, numberOfSteps: number, initialExecutionState = { pc: 0 }, initialUserState = {}) {
	const { generator } = await import(generatorFilePath) as ({ generator: (state: Record<string, any>) => AsyncGenerator<number, any, any> })
	const executionState = initialExecutionState;
	const userState = initialUserState;
	const gen = generator(userState)

	// We are going to yield each line of code as we go in loop below.
	while(true) {
		// don't continue, we executed everything
		if (executionState.pc + 1 > numberOfSteps) {

			break
		}

		const r = await gen.next()


		if (r.done) {
			break;
		}

		executionState.pc++

		// serialize state as a single step (us = userState)
		await toJsonDump(userState, 'us')
		// TODO: serialize execution state for ability to resume (es = executionState)
		await toJsonDump(executionState, 'es')
	}
}

/*
type ExecutionState = { pc: number }
type UserState = Record<string, Record<string, string | number | boolean>>

export async function resumeExecution(
	generatorFilePath: string,
	executionState: ExecutionState,
	userState: UserState,
) {
	const { generator } = await import(generatorFilePath) as ({ generator: (state: Record<string, any>) => AsyncGenerator<number, any, any> })

	// const code = wrapWithGenerator(jsCodeToRun)
	// const outputPath = await storeGeneratorToDisk(code)
	// await executor(path.join('..', outputPath))
}
*/