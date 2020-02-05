
const getImports = require('./utils/get-imports');

module.exports = {
    Import: [
        (node, exported) => {
            if (!exported.imports) {
                exported.imports = [];
            }

            exported.imports.push(getImports(node));
        }
    ]
};
