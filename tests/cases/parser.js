const joy = require('../../index');
const glob = require('glob');
const fs = require('fs');
const path = require('path');

const files = glob.sync(path.join(__dirname, '../data/parser/in/*.joy'));
const table = [];

files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const result = fs.readFileSync(file.replace('/in/', '/out/').replace('.joy', '.json'), 'utf8');

    table.push([path.basename(file, path.extname(file)), content, result]);
});

test.each(table)('%p', (file, content, result) => {
    joy.parse(content, (err, ast) => {
        expect(JSON.parse(ast.serialize())).toStrictEqual(JSON.parse(result));
    });
});
