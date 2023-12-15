export type ExecutionState = {
	pc: number; // Program counter - by line
}
export type UserState = Record<string, any>
export type ExecutorSettings = {
	generatorFilePath: string
	initialExecutionState: ExecutionState
	initialUserState: Record<string, any>
}
export type AfterStepHook = () => void
export type CodegenGeneratorExport = {
	numberOfSteps: number
	generator: (state: Record<string, any>, resumeFromStep: number) => AsyncGenerator<number, any, any>
}


export class Executor {
	private settings: ExecutorSettings
	private hook: AfterStepHook
	private executionState: ExecutionState
	private userState: UserState
	private generator?: AsyncGenerator<number, any, any>
	private numberOfSteps?: number

	constructor(settings: ExecutorSettings) {
		this.settings = settings;
		this.executionState = settings.initialExecutionState
		this.userState = settings.initialUserState
		this.hook = () => {}
	}

	setAfterStepHook(afterStepCall: AfterStepHook) {
		this.hook = afterStepCall
	}

	/**
	 * Make sure we have everything setup before execution starts
	 */
	private executeGuard() {
		if (!this.generator) {
			throw new Error('.setup() wasn\'t called before execution. Make sure it is called.')
		}
	}

	/**
	 * Must be called atleast once before execution.
	 *
	 * Makes generator function instance for `step()` and `execute()`.
	 */
	async setup() {
		const { generatorFilePath } = this.settings
		const { generator, numberOfSteps } = await import(generatorFilePath) as (CodegenGeneratorExport)
		// Init generator with user's state
		// execute and step will use this instance
		this.generator = generator(this.userState, this.executionState.pc)
		this.numberOfSteps = numberOfSteps;
	}

	async execute() {
		this.executeGuard()

		// We are going to yield each line of code as we go in loop below.
		while(true) {
			// don't continue, we executed everything
			if (this.executionState.pc + 1 > this.numberOfSteps!) {
				break
			}

			const isFinished = await this.step()
			if (isFinished) {
				break
			}
		}
	}

	states(): { execution: ExecutionState, user: UserState  }  {
		return {
			execution: this.executionState,
			user: this.userState,
		}
	}

	/**
	 * Run single stepper
	 *
	 * __Can be called standalone__
	 * @returns {Promise<boolean>} signalizes whether we're finished
	 */
	async step(): Promise<boolean> {
		this.executeGuard()
		const r = await this.generator!.next()
		if (r.done) { return true; }
		this.executionState.pc++
		this.hook()
		return false
	}
}
