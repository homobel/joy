
const fs = require('fs');
const path = require('path');

function resolve(value) {
    if (typeof value === 'string') {
        value = path.resolve(value);
        try {
            fs.accessSync(value, fs.F_OK);

            return value;
        } catch (e) {
            console.error(`File not exists: ${value}`);
            return;
        }
    }

    console.error('File not specified');
    return null;
}

module.exports = resolve;
