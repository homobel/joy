
module.exports = {
    Import: [
        (node, exported) => {
            if (!exported.imports) {
                exported.imports = [];
            }

            let name;
            let rename;
            let path;

            const [pathNode, pairNode] = node.childs();

            path = pathNode.get('value');
            path = path.substring(1, path.length - 1);

            if (pairNode.type() === 'Name') {
                name = pairNode.get('value');
            }
            else {
                let pairChilds = pairNode.childs();

                if (pairChilds.length === 1) {
                    name = pairChilds[0].get('value');
                }
                else {
                    name = pairChilds[0].get('value');
                    rename = pairChilds[1].get('value');
                }
            }

            exported.imports.push({
                path,
                name,
                rename
            });
        }
    ]
};
