import { createHash } from 'crypto';
import fs from 'fs/promises';
import path from 'path';

function makeStepper() {
	let step = 0;
	return () => step++
}

const stepper = makeStepper()

export async function toJsonDump(object: Record<string, any>, label: string) {
	const json = JSON.stringify(object);
	return fs.writeFile(path.join('codegen', `${label}.json`), json);
	// const hash = createHash("sha256").update(json).digest("hex");
	// return fs.writeFile(path.join('codegen', `${label}_${stepper()}_${hash}.json`), json)
}

export async function fromJsonDump(label: string) {
	return fs.readFile(path.join('codegen', `${label}.json`))
}
