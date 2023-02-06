"use strict";

const { spawn } = require('child_process');
//_____________________________START APP_____________________________//
function Start() {
    const child = spawn("node", ["--trace-warnings", "--async-stack-traces", "main.js"], {
        cwd: __dirname,
        stdio: "inherit",
        shell: true
    });
    child.on("close", (codeExit) => {
        if (codeExit == 2) {
            Start();
        } else {
            return;
        }
    });
}
Start();