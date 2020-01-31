
const path = require('path');
const fs = require('fs');
const joy = require('../index');

let inputPath = process.argv[2];

if (!inputPath) {
    console.error('File not specified!');
    return;
}

inputPath = path.resolve(inputPath);

if (!fs.existsSync(inputPath)) {
    console.error(`File not exists: ${inputPath}`);
    return;
}

joy.parse(fs.readFileSync(inputPath, 'utf8'), (err, ast) => {
    if (err) {
        console.error(err);
        return;
    }

    console.log(ast.serialize());
});
