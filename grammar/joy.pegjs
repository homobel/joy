{
    const unroll = options.util.makeUnroll(location, options)
    const ast = options.util.makeAST(location, options)

    function joyAddAttr(flag, node, attrsOk, attrsNone) {
        if (!flag) {
            if (attrsNone) {
                return node.set(attrsNone)
            }

            return node
        }

        return node.set(attrsOk)
    }
}

start
    = all:(joy / text)* {
        return ast('Joy').add(unroll(null, all))
    }

joy
    = comment / escape / dep / condition / loop / fn  / variable

text
    = (! JOY_START .)+ {
        return ast('Text').set('value', text())
    }

// escape

escape
    = JOY_START JOY_START {
        return ast('Escape')
    }

// comment

comment
    = JOY_START '*' (! ('*' JOY_START) .)* '*' JOY_START {
        return ast('Comment').set('value', text())
    }

// import

dep
    // @import defaultExport from "module-name"
    = JOY_START 'import' WS+ name:name WS+ 'from' WS+ path:string {
        return ast('Import').add(path).set('value', text().substr(1)).add(name)
    } /
    // @import * as name from "module-name"
    JOY_START 'import' pairs:(WS+ depTerm WS+ 'from') WS+ path:string {
        return ast('Import').add(path).set('value', text().substr(1)).add(pairs[1]);
    }

depTerm
    = what:(depAll / name) rename:(WS+ 'as' WS+ name)? {
        var res = ast('ImportPair').add(what)

        if (rename) {
            res.add(rename[3]).set('withRename', true)
        }

        return res
    }

depAll
    = '*' {
        return ast('ImportAll')
    }

// conditions

condition
    = JOY_START 'if' WS+ cwe:conditionWithExpression cwes:(WS* 'else' WS+ 'if' WS+ conditionWithExpression)* cwte:(WS* 'else' WS+ conditionWithoutExpression)? {
        var res = ast('Condition').add(unroll(cwe, cwes, 5))

        if (cwte) {
            res.add(cwte[3]).set('withElse', true)
        }

        return res
    }

conditionWithExpression
    = expr:expression WS* block:block {
        return ast('ConditionWithExpression').add(expr).add(block)
    }

conditionWithoutExpression
    = block:block {
        return ast('ConditionWithoutExpression').add(block)
    }

// loops

loop
    = JOY_START 'each' WS+ lp:loopParams WS 'in' WS+ items:identifier WS* block:block {
        block.set('isLoop', true);

        return ast('Loop').add(lp).add(items).add(block)
    }

loopParams
    = key:name WS* ':' WS* item:name {
        return ast('KeyValue').add(key).add(item).set('defaultIndex', false)
    }
    / item:name {
        return ast('KeyValue').add(item).set('defaultIndex', true)
    }

// functions

fn
    = JOY_START escape:ESCAPE_OUTPUT? id:fnIdentifier {
        return joyAddAttr(escape, ast('Fn').add(id), {
            escape: true
        }, {
             escape: false
        })
    }

fnIdentifier
    = id:identifier OPEN_ARGS args:fnArgs? CLOSE_ARGS WS* block:block? {
        return ast('FnIdentifier').add(id).add(args).add(block)
    }

fnArgs
    = type:fnArg types:(WS* FN_ARGS_DELIMITER WS* fnArg)* {
        return ast('Arguments').add(unroll(type, types, 3))
    }

fnArg
    = name:name '=' value:expression {
        return ast('NamedArgument').add(name).add(value)
    }
    / expression

// block

joyInBlockText
    = all:(joy / textInBlockEscape / textInBlock / block)* {
        return ast('Joy').add(unroll(null, all))
    }

textInBlockEscape
    = (OPEN_BLOCK_ESCAPED / CLOSE_BLOCK_ESCAPED) {
        return ast('InBlockEscape').set('value', text())
    }

textInBlock
     = (! JOY_START ! OPEN_BLOCK ! CLOSE_BLOCK ! textInBlockEscape .)+ {
        return ast('Text').set('value', text())
    }

block
    = OPEN_BLOCK joy:joyInBlockText? CLOSE_BLOCK {
        return ast('Block').add(joy)
    }

// variable

variable
    = JOY_START escape:ESCAPE_OUTPUT? OPEN_VAR id:identifier CLOSE_VAR {
        return joyAddAttr(escape, ast('Variable').add(id), {
            escape: true
        }, {
             escape: false
        })
    }
    / JOY_START escape:ESCAPE_OUTPUT? id:identifier {
        return joyAddAttr(escape, ast('Variable').add(id), {
            escape: true
        }, {
             escape: false
        })
    }

identifier
    = ! ('import' (WS / EOF)) ! ('if' (WS / EOF)) ! ('each' (WS / EOF)) name:name names:(ID_DELIMITER name)* {
        return ast('Identifier').add(unroll(name, names, 1))
    }

name
    = n:((LC / UC / NON_LETTERS_START) (LC / UC / NON_LETTERS_START / DIGIT)*) {
        return ast('Name').set('value', text())
    }

// expressions

expression
    = logicBinaryExpression

expressionBlock
    = OPEN_PAREN WS* expr:expression WS* CLOSE_PAREN {
        return ast('ExpressionBlock').add(expr)
    }

multBinaryExpression
    = l:expressionArg WS* o:(MULT / DIV / DIV_REM) WS* r:multBinaryExpression {
        return ast('Binary').add(l).add(r).set('operator', o)
    }
    / expressionArg

addBinaryExpression
    = l:multBinaryExpression WS* o:(PLUS / MINUS) WS* r:addBinaryExpression {
        return ast('Binary').add(l).add(r).set('operator', o)
    }
    / multBinaryExpression

compBinaryExpression
    = l:addBinaryExpression WS* o:(LTE / GTE / LT / GT / EQ_STRICT / NOT_EQ_STRICT / EQ / NOT_EQ) WS* r:compBinaryExpression {
        return ast('Binary').add(l).add(r).set('operator', o)
    }
    / addBinaryExpression

logicBinaryExpression
    = l:compBinaryExpression WS* o:(AND / OR) WS* r:logicBinaryExpression {
        return ast('Binary').add(l).add(r).set('operator', o)
    }
    / compBinaryExpression

unaryExpression
    = o:(INV / PLUS / MINUS) r:types {
        return ast('Unary').add(r).set('operator', o)
    }
    / o:(INV / PLUS / MINUS) r:expressionBlock {
        return ast('Unary').add(r).set('operator', o)
    }

expressionArg
    = unaryExpression
    / expressionBlock
    / types

// types

types
    = bool / number / nil / undef / string / fnIdentifier / identifier

number
    = DIGIT+ ('.' DIGIT+)* {
        return ast('Number').set('value', text())
    }

bool
    = (TRUE / FALSE) {
        return ast('Boolean').set('value', text())
    }

nil
    = NULL {
        return ast('NULL')
    }

undef
    = UNDEFINED {
        return ast('Undefined')
    }

string
    = (
        '"' ([^\r\n\f\\"] /  '\\"')* '"' /
        "'" ([^\r\n\f\\'] / "\\'")* "'"
    ) {
        return ast('String').set('value', text())
    }

// tokens

JOY_START
    = '@'

LC
    = [a-z]

UC
    = [A-Z]

DIGIT
    = [0-9]

NON_LETTERS_START
    = [_$]

OPEN_DESTRUCT
    = '{'

CLOSE_DESTRUCT
    = '}'

ESCAPE_OUTPUT
    = '!'

OPEN_VAR
    = '('

CLOSE_VAR
    = ')'

OPEN_ARGS
    = '('

CLOSE_ARGS
    = ')'

OPEN_BLOCK
    = '{'

CLOSE_BLOCK
    = '}'

OPEN_BLOCK_ESCAPED
    = '\\{'

CLOSE_BLOCK_ESCAPED
    = '\\}'

FN_ARGS_DELIMITER
    = ','

LOOP_ARGS_DELIMITER
    = ':'

ID_DELIMITER
    = '.'

UNDEFINED
    = 'undefined'

NULL
    = 'null'

TRUE
    = 'true'

FALSE
    = 'false'

// expression

INV
    = '!'

PLUS
    = '+'

MINUS
    = '-'

MULT
    = '*'

DIV
    = '/'

DIV_REM
    = '%'

LT
    = '<'

GT
    = '>'

LTE
    = '<='

GTE
    = '>='

EQ
    = '=='

NOT_EQ
    = '!='

EQ_STRICT
    = '==='

NOT_EQ_STRICT
    = '!=='

AND
    = '&&'

OR
    = '||'

OPEN_PAREN
    = '('

CLOSE_PAREN
    = ')'

// white spaces

WS
    = [ \t\r\n]+

LINE_TERMINATOR
    = '\n'
    / '\r\n'
    / '\r'
    / '\f'

EOF
    = !.
