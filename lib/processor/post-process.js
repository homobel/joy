
const {fn, str, rt} = require('./utils');

function es5Require(name, path) {
    return `var ${name} = require("${path}");/r/n`;
}

function es6Require(name, path) {
    return `const ${name} = require("${path}");/r/n`;
}

function postProccess(options, extracted, res) {
    let prefix = '';
    let postfix = '';

    if (options.modules === 'es6') {
        prefix += `import * as joy from "${options.runtimePath}"/r/n`;

        if (extracted.imports) {
            prefix += extracted.imports.map((imp) => {
                return imp.get('value');
            }).join('/r/n') + '/r/n/r/n';
        }

        prefix += 'exports default ';
    }
    else if (options.modules === 'commonjs') {
        const req = options.jsVersion === 'es5' ? es5Require : es6Require;

        prefix += req('joy', options.runtimePath);

        if (extracted.imports) {
            prefix += extracted.imports.map((imp) => {
                const [path, pair] = imp.childs();
                let pathSliced = path.get('value');
                pathSliced = pathSliced.substring(1, pathSliced.length - 1);
                let pairChilds = pair.childs();
                let name;

                if (pairChilds.length === 1) {
                    name = pairChilds[0].get('value');
                }
                else {
                    name = pairChilds[1].get('value');
                }

                return req(name, pathSliced);
            }) + '/r/n/r/n';
        }

      prefix += 'module.exports = ';
    }
    else if (options.modules === 'amd') {
        const depNames = ['joy'];
        const depPathes = [options.runtimePath];

        if (extracted.imports) {
            extracted.imports.forEach((imp) => {
                const [path, pair] = imp.childs();
                let pathSliced = path.get('value');
                pathSliced = pathSliced.substring(1, pathSliced.length - 1);
                let pairChilds = pair.childs();
                let name;

                if (pairChilds.length === 1) {
                    name = pairChilds[0].get('value');
                }
                else {
                    name = pairChilds[1].get('value');
                }

                depNames.push(name);
                depPathes.push(pathSliced);
            });
        }

        if (options.jsVersion === 'es5') {
            prefix = `define([${depPathes.map(str).join(', ')}], function(${depNames.join(', ')}) {return `;

            postfix = '});'
        }
        else {
            prefix = `define([${depPathes.map(str).join(', ')}], (${depNames.join(', ')}) => {return `;

            postfix = '});'
        }
    }

    if (res === '') {
        res = '"";';
    }
    else {
        res += ';'
    }

    return prefix + fn(options, 'data', 'data=' + rt(options, 'options', 'data') + ';' + 'return ' + res) + postfix;
}

module.exports = postProccess;
