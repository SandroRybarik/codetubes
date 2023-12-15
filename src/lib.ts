import { readFileSync } from "fs"
import process from "process"
import fs from "fs/promises"
import { wrapWithGenerator } from "./codegen"

export function loadFileFromCli(): string {
	const [filePath] = process.argv.slice(2)
	return readFileSync(filePath).toString('utf8')
}

export async function fileExists(filePath: string): Promise<boolean> {
	try {
		await fs.access(filePath, fs.constants.F_OK);
		return true
	} catch {
		return false
	}
}

export async function makeGeneratorJs(outputPath: string): Promise<void> {
	const jsCodeToRun = loadFileFromCli()
	const { mainFileSource }  = wrapWithGenerator(jsCodeToRun)
	await fs.writeFile(outputPath, mainFileSource, 'utf-8')
}