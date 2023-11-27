import fs from "fs/promises";
import path from "path";

type StateManagerOptions = {
	// String path where state should be stored
	dir: string;
	// Filename of the serialized state
	fname: string;
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
		const storePath = path.join(this.options.dir, `${this.options.fname}.json`)
		const readFileBuf = await fs.readFile(storePath, 'utf8');
		const stateJsonStr = readFileBuf.toString()
		return JSON.parse(stateJsonStr);
	}

	/**
	 * Stores state to disk.
	 */
	save(state: Record<string, any>): Promise<void> {
		const json = JSON.stringify(state);
		const storePath = path.join(this.options.dir, `${this.options.fname}.json`)
		return fs.writeFile(storePath, json);
	}
}
