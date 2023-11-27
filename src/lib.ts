import { readFileSync } from "fs"
import process from "process"

export function loadFileFromCli(): string {
	const [filePath] = process.argv.slice(2)
	return readFileSync(filePath).toString('utf8')
}
