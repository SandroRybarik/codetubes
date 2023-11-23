import fs from 'fs/promises'
import path from 'path'

/**
 * Generates TS file wrapped as generator function
 * allowing us to yield each line of code.
 * @version 0.0.1-MVP
 */
export function wrapWithGenerator(jsCodeLines: string, resumeToStep = 0) {
	const addYieldStatement = (lc: string, caseVarName: string) => {
		const detectRequireImport = /require\(.+\)/

		if (detectRequireImport.test(lc)) {
			return lc
		}

		// pc${pcLabel} allow us to use goto to skip execution steps
		// during resume
		return `case ${caseVarName}:\n ${lc}\n` + 'yield null;'
	}

	const replaceAssignments = (lc: string) => {
		const detectAssignment = /(const|let|var)\s*([^\s]+)\s*=/
		const detectReassignment = /^([^\\s]+)\s*(=|\*=|-=|\/=|\+=|\+\+|--)/

		const assignment = detectAssignment.exec(lc)
		const reassignment = detectReassignment.exec(lc)

		// modify assignment state to $state.[VARNAME] = ...
		if (assignment) {
			const keyword = assignment[1]
			const varName = assignment[2]
			let newLc = lc.replace(keyword, '')
			newLc = newLc.replace(varName, `$state.${varName}`)
			return newLc
		}

		// modify assignment state to $state.[VARNAME] = ...
		if (reassignment) {
			const varName = reassignment[1]
			return lc.replace(varName, `$state.${varName}`)
		}

		return lc
	}

	const { before, mainBody } = extractMainFileParts(jsCodeLines)

	const startVarName = '$start'
	const caseVarName = '$step'
	let generatorBodyCode = mainBody
		.split("\n")
		.map(lc => lc.trim())
		.filter(lc => lc !== '')
		// .map(replaceAssignments)

	// This is useful for executor to know how many steps this function should do
	const numberOfSteps = generatorBodyCode.length

	generatorBodyCode = generatorBodyCode
		.map((lc, i) => addYieldStatement(lc, `${caseVarName}+${i}`))


	const mainFileSource = `
			${before}

			async function *generator($state) {
				const ${startVarName} = ${resumeToStep}
				const ${caseVarName} = 0;
				switch(${startVarName}) {
				${generatorBodyCode.join('\n')}
				}
			}

			module.exports = {
				generator
			}
		`

	return {
		mainFileSource,
		numberOfSteps,
	}
}



/**
 * Find and locate async function main() { <[BODY]> }
 * and extracts its body statements.
 */
export function extractMainFileParts(jsSource: string) {
	// Find main function declaration and get everything until end of the file
	// After that omit last `}`
	const mainFunc = /async\s*function\s*main\s*\(\s*\$state\)\s*{/
	const matchMainFuncDeclaration = jsSource.match(mainFunc)

	if (!matchMainFuncDeclaration) {
		throw new Error("Missing main function")
	}

	const lenOfMainFuncDeclaration = matchMainFuncDeclaration[0].length
	const indexOfMainFunc = jsSource.search(mainFunc)
	// We are only interested in the body part.
	const ommitedDeclaration = jsSource.substring(indexOfMainFunc + lenOfMainFuncDeclaration)
	const lastLeftCurlyBraceIndex = ommitedDeclaration.lastIndexOf('}')
	const justBody = ommitedDeclaration.substring(0, lastLeftCurlyBraceIndex)
	const restOfFile = jsSource.substring(0, indexOfMainFunc)

	return {
		before: restOfFile,
		mainBody: justBody,
	}
}

export async function storeGeneratorToDisk(generatorFunction: string): Promise<string> {
	const fileName = 'generator.js'
	const outputPath = path.join('codegen', fileName);
	await fs.writeFile(outputPath, generatorFunction)
	return outputPath
}
