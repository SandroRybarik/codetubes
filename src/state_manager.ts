import fs from "fs/promises";
import path from "path";

type StateManagerOptions = {
	// File path of the serialized state
	file: string;
}

export default class StateManager {
	private options: StateManagerOptions

	constructor(options: StateManagerOptions) {
		this.options = options
	}

	/**
	 * Loads state from disk.
	 */
	async load<T>(): Promise<T> {
		const readFileBuf = await fs.readFile(this.options.file, 'utf8');
		const stateJsonStr = readFileBuf.toString()
		return JSON.parse(stateJsonStr);
	}

	/**
	 * Stores state to disk.
	 */
	save(state: Record<string, any>): Promise<void> {
		const json = JSON.stringify(state);
		return fs.writeFile(this.options.file, json);
	}
}
