
const {fn, str, rt, notEmpty} = require('./utils');
const {handle} = require('./handle');
const postProcess = require('./post-process');
const embeddedExtractors = require('./extractors');
const embeddedValidators = require('./validators');

const nodeProcessors = {
    Joy(node, exported, options) {
        handle(node, exported, options);

        return processNodes(node.childs(), exported, options);
    },
    Text(node, exported, options) {
        handle(node, exported, options);

        return str(node.get('value'));
    },
    Escape(node, exported, options) {
        handle(node, exported, options);

        return str('@');
    },
    Comment(node, exported, options) {
        handle(node, exported, options);

        return '';
    },
    Import(node, exported, options) {
        handle(node, exported, options);

        return '';
    },
    Condition(node, exported, options) {
        handle(node, exported, options);

        const childs = node.childs();
        let tail = str('');
        let conditions = childs.map(child => processNodes(child, exported, options));
        const l = conditions.length - 1;

        if (node.get('withElse')) {
            tail = conditions[l];
            conditions = conditions.slice(0, l);
        }

        let res = '';

        conditions.forEach(condition => res += condition);

        res += tail;

        return '(' + res + ')';
    },
    ConditionWithExpression(node, exported, options) {
        handle(node, exported, options);

        const [expr, block] = node.childs();

        return '(' + processNodes(expr, exported, options) + ')?' + notEmpty(processNodes(block, exported, options)) + ':';
    },
    ConditionWithoutExpression(node, exported, options) {
        handle(node, exported, options);

        return notEmpty(processNodes(node.childs(), exported, options));
    },
    Loop(node, exported, options) {
        handle(node, exported, options);

        const [keyValue, items, block] = node.childs();

        return rt(options, 'loop', processNodes(items, exported, options) + ', ' + fn(options, processNodes(keyValue, exported, options), processNodes(block, exported, options)));
    },
    KeyValue(node, exported, options) {
        handle(node, exported, options);

        const defaultIndex = node.get('defaultIndex');
        const [key, value] = node.childs();

        if (defaultIndex) {
            return processNodes(key, exported, options) + ',i';
        }

        return processNodes(value, exported, options) + ',' + processNodes(key, exported, options);
    },
    Fn(node, exported, options) {
        handle(node, exported, options);

        const escaped = node.get('escape');
        const childs = node.childs();

        if (escaped) {
            return rt(options, 'print', processNodes(childs, exported, options));
        }

        return rt(options, 'escape', rt(options, 'print', processNodes(childs, exported, options)));
    },
    FnIdentifier(node, exported, options) {
        handle(node, exported, options);

        const [id] = node.childs();

        let args;
        let block;

        node.childs().forEach((child, i) => {
            if (i > 0) {
                if (child.type() === 'Arguments') {
                    args = child;
                }
                else {
                    block = child;
                }
            }
        });

        const hasArgs = args && args.childs().length > 0;
        let hasBlock = Boolean(block);
        let hasNamedArgs = args && args.childs().some(child => child.type() === 'NamedArgument');

        const argsRes = hasArgs ? processNodes(args, exported, options) : '';
        let separator = hasArgs ? ',' : '';
        let blockRes = hasBlock ? processNodes(block, exported, options) : '';

        blockRes = blockRes || str('');

        separator = hasBlock ? separator : '';

        if (hasNamedArgs || hasBlock) {
            if (hasArgs) {
                if (hasBlock) {
                    return processNodes(id, exported, options) + '(' + argsRes.substring(0, argsRes.length - 1) + separator + 'content:' + blockRes + '})'; // } substringed then added
                }

                return processNodes(id, exported, options) + '(' + argsRes + ')';
            }

            if (hasBlock) {
                return processNodes(id, exported, options) + '({content:' + blockRes + '})';
            }

            return processNodes(id, exported, options) + '()';
        }

        if (hasBlock) {
            return processNodes(id, exported, options) + '(' + argsRes + separator + blockRes + ')';
        }

        return processNodes(id, exported, options) + '(' + argsRes + ')';
    },
    Arguments(node, exported, options) {
        handle(node, exported, options);

        const childs = node.childs();
        const hasNamedArgs = childs.some(child => child.type() === 'NamedArgument');
        const parentChilds = node.parent().childs();
        const parentHasBlock = parentChilds[parentChilds.length - 1].type() === 'Block';

        if (hasNamedArgs || parentHasBlock) {
            return '{' + childs.map(child => processNodes(child, exported, options)).join(',') + '}';
        }

        return childs.map(child => processNodes(child, exported, options)).join(',');
    },
    NamedArgument(node, exported, options) {
        handle(node, exported, options);

        const [key, value] = node.childs();

        return processNodes(key, exported, options) + ':' + processNodes(value, exported, options);
    },
    InBlockEscape(node, exported, options) {
        handle(node, exported, options);

        return str(node.get('value').substr(1));
    },
    Block(node, exported, options) {
        handle(node, exported, options);

        if (node.parent().type() === 'Joy') {
            return str('{') + '+' + processNodes(node.childs(), exported, options) + '+' + str('}');
        }
        else if (node.get('isLoop')) {
            return 'return ' + processNodes(node.childs(), exported, options);
        }

        return processNodes(node.childs(), exported, options);
    },
    Variable(node, exported, options) {
        handle(node, exported, options);

        const escaped = node.get('escape');
        const childs = node.childs();

        if (escaped) {
            return rt(options, 'print', processNodes(childs, exported, options));
        }

        return rt(options, 'escape', rt(options, 'print', processNodes(childs, exported, options)));
    },
    Identifier(node, exported, options) {
        handle(node, exported, options);

        const childs = node.childs();

        return childs.map(child => processNodes(child, exported, options)).join('.');
    },
    Name(node, exported, options) {
        handle(node, exported, options);

        return node.get('value');
    },
    ExpressionBlock(node, exported, options) {
        handle(node, exported, options);

        return '(' + processNodes(node.childs(), exported, options) + ')';
    },
    Binary(node, exported, options) {
        handle(node, exported, options);

        let [left, right] = node.childs();

        return processNodes(left, exported, options) + node.get('operator') + processNodes(right, exported, options);
    },
    Unary(node, exported, options) {
        handle(node, exported, options);

        return node.get('operator') + processNodes(node, exported, options);
    },
    Number(node, exported, options) {
        handle(node, exported, options);

        return node.get('value');
    },
    Boolean(node, exported, options) {
        handle(node, exported, options);

        return node.get('value');
    },
    NULL(node, exported, options) {
        handle(node, exported, options);

        return 'null';
    },
    Undefined(node, exported, options) {
        handle(node, exported, options);

        return 'undefined';
    },
    String(node, exported, options) {
        handle(node, exported, options);

        return node.get('value');
    }
};

function processNodes(nodes, exported, options) {
    if (Array.isArray(nodes)) {
        return nodes
            .map(node => nodeProcessors[node.type()](node, exported, options))
            .filter(res => res !== '')
            .join('+');
    }

    return nodeProcessors[nodes.type()](nodes, exported, options);
}

const nodeProcessorKeys = Object.keys(nodeProcessors);

module.exports = (ast, options) => {
    const extractorsInOptions = options.extractors || {};
    const validatorsInOptions = options.validators || {};
    const extracted = {};
    const extractors = {};
    const validators = {};

    nodeProcessorKeys.forEach((key) => {
        extractors[key] = [].concat(embeddedExtractors[key] || []).concat(extractorsInOptions[key] || []);
        validators[key] = [].concat(embeddedValidators[key] || []).concat(validatorsInOptions[key] || []);
    });

    options = Object.assign({}, options, {
        extractors: extractors,
        validators: validators
    });

    return {
        content: postProcess(options, extracted, processNodes(ast, extracted, options)),
        extracted: extracted
    };
};
