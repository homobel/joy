
module.exports = {
    Import: [
        (node, exported) => {
            if (!exported.imports) {
                exported.imports = [];
            }

            const [pathNode, pairNode] = node.childs();
            let path = pathNode.get('value');
            path = path.substring(1, path.length - 1);
            let pairChilds = pairNode.childs();
            let name;
            let rename;

            if (pairChilds.length === 1) {
                name = pairChilds[0].get('value');
            }
            else {
                name = pairChilds[0].get('value');
                rename = pairChilds[1].get('value');
            }

            exported.imports.push({
                path,
                name,
                rename
            });
        }
    ]
};
