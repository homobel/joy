
const getImports = require('./utils/get-imports');
const FORBIDDEN_NAMES = ['joy', 'data'];

module.exports = {
    Import: [
        (node, exported) => {
            // check import lvl
            if (node.parent().parent()) {
                throw Error('Import statement must be on the top level');
            }

            let {name, rename} = getImports(node);

            // check for reserved words
            if (FORBIDDEN_NAMES.includes(rename || name)) {
                throw Error('Import will be hidden by data namespace');
            }

            // check names duplications
            if (exported.imports) {
                if (exported.imports.some(imp => {
                    if (imp.rename) {
                        if (rename) {
                            return imp.rename === rename;
                        }
                        return imp.rename === name;
                    }

                    if (rename) {
                        return imp.name === rename;
                    }
                    return imp.name === name;
                })) {
                    throw Error(`Import duplication: ${rename || name}`);
                }
            }
        }
    ],
    Arguments: [
        node => {
            const childs = node.childs();
            const parentChilds = node.parent().childs();
            const parentHasBlock = parentChilds[parentChilds.length - 1].type() === 'Block';
            let hasNamedArgs = false;
            let hasNoNamedArgs = false;
            let allNamed = 0;

            childs.forEach(child => {
                if (child.type() === 'NamedArgument') {
                    hasNamedArgs = true;
                    allNamed++;
                }
                else {
                    hasNoNamedArgs = true;
                }
            });

            if (
                (hasNamedArgs && childs.length !== allNamed) ||
                (parentHasBlock && hasNoNamedArgs)
            ) {
                throw Error('Functions with named arguments must have all arguments named (content is also named argument)');
            }
        }
    ],
    NamedArgument: [
        node => {
            const [key] = node.childs();

            if (key.get('value') === 'content') {
                throw Error('Name "content" is reserved for block value');
            }
        }
    ],
    Loop: [
        node => {
            const [keyValueNode] = node.childs();
            const [keyOrVal, val] = keyValueNode.childs();

            if (
                (keyOrVal && FORBIDDEN_NAMES.includes(keyOrVal.get('value'))) ||
                (val && FORBIDDEN_NAMES.includes(val.get('value')))
            ) {
                throw Error('Loop uses reserved variable name');
            }
        }
    ]
};
