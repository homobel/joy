
module.exports = {
    Import: [
        node => {
            if (node.parent().parent()) {
                throw Error('Import statement must be on the top level');
            }
        },
        (node, exported) => {
            if (!exported.imports) {
                return;
            }

            let name;
            let rename;
            let path;

            const [pathNode, pairNode] = node.childs();

            path = pathNode.get('value');
            path = path.substring(1, path.length - 1);

            if (pairNode.type() === 'Name') {
                name = pairNode.get('value');
            } else {
                let pairChilds = pairNode.childs();

                if (pairChilds.length === 1) {
                    name = pairChilds[0].get('value');
                } else {
                    name = pairChilds[0].get('value');
                    rename = pairChilds[1].get('value');
                }
            }

            if (exported.imports.some(imp => {
                if (imp.rename) {
                    if (rename) {
                        return imp.rename === rename;
                    }
                    else {
                        return imp.rename === name;
                    }
                }
                else { // name
                    if (rename) {
                        return imp.name === rename;
                    }
                    else {
                        return imp.name === name;
                    }
                }
            })) {
                throw Error(`Import duplication: ${rename || name}`);
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
    ]
};
