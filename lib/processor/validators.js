
module.exports = {
    Import: [
        node => {
            if (node.parent().parent()) {
                throw Error('Import statement must be on the top level');
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
