
const {fn, str, rt} = require('./utils');

function es5Require(name, path) {
    if (name) {
        return `var ${name} = require("${path}");\r\n`;
    }

    return `require("${path}");\r\n`;
}

function es6Require(name, path) {
    if (name) {
        return `const ${name} = require("${path}");\r\n`;
    }

    return `require("${path}");\r\n`;
}

function postProccess(options, extracted, res) {
    let prefix = '';
    let postfix = '';

    if (extracted.imports) {
        const named = [];
        const nonamed = [];

        extracted.imports.forEach(i => {
            if (i.name || i.rename) {
                named.push(i);
            }
            else {
                nonamed.push(i);
            }
        });

        extracted.imports = named.concat(nonamed);
    }

    if (options.modules === 'es6') {
        prefix += `import * as joy from "${options.runtimePath}";\r\n`;

        if (extracted.imports) {
            prefix += extracted.imports.map(imp => {
                if (!imp.name && !imp.rename) {
                    return `import "${imp.path}";`;
                }

                if (!imp.rename) {
                    return `import ${imp.name} "${imp.path}";`;
                }

                return `import ${imp.name || '*'} as ${imp.rename} from "${imp.path}";`;
            }).join('\r\n') + '\r\n\r\n';
        }

        prefix += 'export default ';
    }
    else if (options.modules === 'commonjs') {
        const req = options.jsVersion === 'es5' ? es5Require : es6Require;

        prefix += req('joy', options.runtimePath);

        if (extracted.imports) {
            prefix += extracted.imports.map((imp) => {
                const name = imp.rename || imp.name;

                return req(name, imp.path);
            }).join('') + '\r\n';
        }

        prefix += 'module.exports = ';
    }
    else if (options.modules === 'amd') {
        const depNames = ['joy'];
        const depPathes = [options.runtimePath];

        if (extracted.imports) {
            extracted.imports.forEach((imp) => {
                const name = imp.rename || imp.name;

                if (name) {
                    depNames.push(name);
                }
                depPathes.push(imp.path);
            });
        }

        if (options.jsVersion === 'es5') {
            prefix = `define([${depPathes.map(str).join(', ')}], function(${depNames.join(', ')}) {\r\nreturn `;

            postfix = '\r\n});';
        }
        else {
            prefix = `define([${depPathes.map(str).join(', ')}], (${depNames.join(', ')}) => {\r\nreturn `;

            postfix = '\r\n});';
        }
    }

    if (res === '') {
        res = '"";';
    }
    else {
        res += ';';
    }

    return prefix + fn(options, 'data', 'data=' + rt(options, 'options', 'data') + ';' + 'return ' + res) + postfix;
}

module.exports = postProccess;
