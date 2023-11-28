# Code Tubes

Run javascript line by line with ability to resume execution later.



## About

This project is exploring step-based execution alongside with code generation and exploiting js generators and switch statement.


## Usage

1. Create js file with `async function main($state) {}` which is located at the end of the file. Check _example/myjs.js_
1. If you need variables, use `$state` variable - this state is auto persisted after each line execution.
1. Each line in this `main()` function will be treated as single step you can execute with `npm run step`.

```sh
npm run step ./example/myjs.js # run one step
npm run run ./example/myjs.js # run line by line entire myjs.js file
npm run resume ./example/myjs.js # run entire myjs.js from last known step
```
