
const runtime = require('../../runtime');
const runtimeShort = {};

Object.keys(runtime).forEach((key) => {
    if (key.length > 1) {
        runtimeShort[key] = runtime[key].short;
    }
});

function str(value, noQuotesEscape) {
    if (noQuotesEscape) {
        return `'${value.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t')}'`;
    }
    return `'${value.replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t')}'`;
}

function fn(options, args, body) {
    if (options.jsVersion === 'es5') {
        return `function(${args}) {${body}}`
    }
    else {
        return `(${args}) => {${body}}`;
    }
}

function rt(options, method, ...args) {
    method = options.shortRuntime ? runtimeShort[method] : method;

    return `joy.${method}(${args})`;
}

exports.str = str;
exports.fn = fn;
exports.rt = rt;
