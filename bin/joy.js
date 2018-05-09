#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const program = require('commander');
const packageFile = require('../package.json');
const defaults = require('../lib/defaults');
const joy = require('../' + packageFile.main);

function resolve(value) {
    if (typeof value === 'string') {
        value = path.resolve(value);
        try {
            fs.accessSync(value, fs.F_OK);

            return value;
        } catch (e) {
            console.error('file not exists');
        }
    }
    console.error('file not specified');

    return null;
}

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

const inputPath = resolve(program.args[0]);

if (inputPath) {
    const input = fs.readFileSync(inputPath, program.charset);
    const options = {
        modules: program.modules,
        jsVersion: program.js,
        runtimePath: program.runtimePath,
        shortRuntime: program.shortRuntime,
        beautify: program.beautify,
    };

    joy.build(input, options, function(err, data) {
        if (err) {
            console.error(err);
            return;
        }
        console.log(data);
    });
}
