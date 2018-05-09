const ASTY = require('asty');
const pegUtil = require('pegjs-util');
const parser = require('./lib/generated/parser');
const processor = require('./lib/processor/processor');
const defaults = require('./lib/defaults');

//TODO: beautify

module.exports = {
    build(input, options, cb) {
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
            cb(null, processor(parsed, options));
        }
        catch(err) {
            cb(err);
        }
    }
};
