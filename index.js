const fs = require('fs');
const ASTY = require('asty');
const prettier = require('prettier');
const pegUtil = require('pegjs-util');
const parser = require('./lib/generated/parser');
const processor = require('./lib/processor/processor');
const defaults = require('./lib/defaults');
const requireFromString = require('require-from-string');

const tplCache = new Map();

const joy = {
    build(input, options, cb) {
        if (cb === undefined && typeof options === 'function') {
            cb = options;
            options = {};
        }

        options = Object.assign({}, defaults, options);

        this.parse(input, options, (err, ast) => {
            if (err) {
                console.error(err);
            }
            else {
                // console.log(ast.dump().replace(/\n$/, ""));
                this.process(ast, options, (err, result) => {
                    if (err) {
                        console.error(err);
                        cb(err);
                    }
                    else {
                        cb(null, result);
                    }
                });
            }
        });
    },
    parse(input, options, cb) {
        const asty = new ASTY();
        const result = pegUtil.parse(parser, input, {
            startRule: 'start',
            makeAST: function (line, column, offset, args) {
                return asty.create.apply(asty, args).pos(line, column, offset);
            }
        });

        cb(result.error, result.ast);
    },
    process(parsed, options, cb) {
        try {
            let res = processor(parsed, options);

            if (options.beautify) {
                res.content = prettier.format(res.content, {parser: 'babel'});
            }

            cb(null, res);
        }
        catch(err) {
            cb(err);
        }
    }
};

// to avoid binding
joy.__express = (filePath, data, cb) => {
    if (tplCache.has(filePath)) {
        cb(null, tplCache.get(filePath)(data));
    }
    else {
        fs.readFile(filePath, (err, content) => {
            if (err) {
                return cb(new Error(err));
            }

            joy.build(content.toString(), {modules: 'commonjs'}, (err, result) => {
                if (err) {
                    return cb(new Error(err));
                }

                const tpl = requireFromString(result.content);
                tplCache.set(filePath, tpl);

                cb(null, tpl(data));
            });
        });
    }
};

module.exports = joy;
