#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const program = require('commander');
const defaults = require('../lib/defaults');
const packageFile = require('../package.json');
const joy = require('../' + packageFile.main);

program
    .version(packageFile.version)
    .usage('[options] <file ...>')
    .option('-t, --charset <charset>', 'files charset', 'utf8')
    .option('-m, --modules <modules>', 'module system', /^(es6|amd|commonjs)$/i, defaults.modules)
    .option('-p, --runtime-path <runtimePath>', 'runtime path', defaults.runtimePath)
    .option('-s, --short-runtime <shortRuntime>', 'short runtime', defaults.shortRuntime)
    .option('-j, --js <jsVersion>', 'js version', /^(es5|es6)$/i, defaults.jsVersion)
    .option('-b, --beautify <beautify>', 'formatted code', defaults.beautify)
    .parse(process.argv);

let inputPath = program.args[0];

if (!inputPath) {
    console.error('File not specified');
    return;
}

inputPath = path.resolve(inputPath);

if (fs.existsSync(inputPath) && fs.statSync(inputPath).isFile()) {
    const input = fs.readFileSync(inputPath, program.charset);
    const options = {
        charset: program.charset,
        modules: program.modules,
        runtimePath: program.runtimePath,
        shortRuntime: program.shortRuntime,
        jsVersion: program.js,
        beautify: program.beautify
    };

    joy.build(input, options, function(err, data) {
        if (err) {
            console.error(err);
            return;
        }
        console.log(data.content);
    });
}
else {
    console.error(`File not exists: ${inputPath}`);
}
