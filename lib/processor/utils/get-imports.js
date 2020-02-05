
function getImports(node) {
    let name;
    let rename;
    let path;

    const [pathNode, pairNode] = node.childs();

    path = pathNode.get('value');
    path = path.substring(1, path.length - 1);

    if (pairNode.type() === 'Name') {
        name = pairNode.get('value'); // remove ''
    }
    else {
        let pairChilds = pairNode.childs();

        if (pairChilds.length === 1) { // import name from path
            name = pairChilds[0].get('value');
        }
        else {
            name = pairChilds[0].get('value'); // import name as rename from path
            rename = pairChilds[1].get('value');
        }
    }

    return {
        name,
        rename,
        path
    };
}

module.exports = getImports;
