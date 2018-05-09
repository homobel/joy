
module.exports = {
    Import: [
        (node, exported) => {
            if (!exported.imports) {
                exported.imports = [];
            }

            exported.imports.push(node);
        }
    ]
};
