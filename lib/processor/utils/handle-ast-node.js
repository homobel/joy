
function call(arr, node, exported, options) {
    arr.forEach(fn => fn(node, exported, options));
}

function extract(node, exported, options) {
    const type = node.type();

    call(options.extractors[type], node, exported, options);
}

function validate(node, exported, options) {
    const type = node.type();

    call(options.validators[type], node, exported, options);
}

function handle(node, exported, options) {
    validate(node, exported, options);
    extract(node, exported, options);
}

exports.extract = extract;
exports.validate = validate;
exports.handle = handle;
