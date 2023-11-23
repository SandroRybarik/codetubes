import {describe, expect, test} from '@jest/globals';
import { extractMainFileParts, wrapWithGenerator } from '../codegen';


describe('Extract main body from function', () => {
  test('single line extraction', () => {
    const extract = extractMainFileParts(`
      async function main($state) {

        const x = 1;

      }

    `)

    const body = extract.mainBody
    expect(body.trim()).toBe('const x = 1;');
  });

  test('multiline line extraction', () => {
    const extract = extractMainFileParts(`

      async function main($state) {

        const y = 1;
        const q = () => {};

      }
    `)

    const body = extract.mainBody
    expect(body.trim().split('\n').map(l => l.trim()).join('')).toBe('const y = 1;const q = () => {};');
  });

  test('testing outer body code', () => {
    const extract = extractMainFileParts(`
      import fs from "fs";
      import crypto from "crypto";

      async function main($state) {

        const y = 1;
        const q = () => {};

      }
    `)

    const before = extract.before
    expect(before.trim()).toBe('import fs from "fs";\n      import crypto from "crypto";');
  });
});

describe('Producing generator function', () => {
  test('*generator()', () => {
    const x = wrapWithGenerator(`
      import fs from "fs";

      async function main($state) {
        const x = 1;
        x *= 1;
      }
    `).mainFileSource

    console.log({x})
  })
});