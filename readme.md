# Joy

Js template engine.

This is an early release, use it at your own risk.

Summary:
1. razor like syntax
2. precompilation only
3. templates are modules
4. templates and helpers are pure functions
5. clear names collision solving
6. compression in mind

## Usage

### Bash

Installation:
```bash
npm i -g joytpl
```

```
joytpl -h

  Usage: joytpl [options] <file ...>

  Options:

    -V, --version                       output the version number
    -t, --charset <charset>             files charset (default: utf8)
    -m, --modules <modules>             module system (default: es6)
    -p, --runtime-path <runtimePath>    runtime path (default: joytpl/runtime)
    -s, --short-runtime <shortRuntime>  short runtime (default: false)
    -j, --js <jsVersion>                js version (default: es6)
    -b, --beautify <beautify>           formatted code (default: false)
    -h, --help                          output usage information
```

* **modules**: es6, commonjs, amd
* **jsVersion**: es5, es6

Write result in an output file:
```bash
joytpl path/to/input/file > output/file
```

### Code

```bash
npm i joytpl
```

```js
const joy = require('joytpl');

joy.build(inputText, options, function(err, data) {
    if (err) {
        console.error(err);
        return;
    }

    // data.content
    // data.extracted
});
```
Beyond same options available in bash there some advanced ones:
```
{
    ...
    extractors: {type: [fn1, fn2], ...},
    validators: {type: [fn3], ...}
    
    // fnN(node, exported, options) {...}
}
```
You can add custom extractors or validators to specific AST node type.  
Want to forbade some variables names or extract all l10n text to single JSON file? No problem.

## Syntax

#### Comments

```joy
@* you will never recall what this code for *@
```

#### Imports

```joy
@import * as foo from 'bar/foo' 
```
Currently it's the only syntax supported.

Based on modules option it goes to:
```js
import * as foo from 'bar/foo'
var foo = require('bar/foo');
define([..., 'bar/foo'], function(..., foo) {});
```

#### Escape

Start sequence escape:

```joy
big.boss@@gmail.com
```

Escape unpaired brackets in blocks:

```joy
... {
    \}
    \{
}
```

Paired brackets may stay unescaped:

```joy
... {
    <script type="application/json">
        {
            "foo": "bar"
        }
    </script>
}
```

#### Variables

All variables passed in a tpl function via object can be used with data prefix like:
```joy
Hello, @data.name!
```

Some more examples:

```joy
@htmlEscaped @* escape utility by default *@
@!htmlRaw @* raw html *@

@foo.boo.htmlEscaped  @* with namespace *@
@!foo.boo.htmlRaw

@(hello)world together @* with borders *@
@!(hello)again
```

#### Functions

Arguments in functions are expressions with any supported types.

```joy
@foo.fn(100.1 + 1, null, undefined, true, "foo", name='foo', !isEmpty, gag(false, 2312) {
    <h1>@title</h1>
})
```

Here _name='foo'_ is named argument.

Unlike in js, **BLOCK AFTER FUNCTION IS ALSO FUNCTION'S NAMED ARGUMENT**(it's reserved name - content). Treat it as an easy form of passing big chunk of text.  
Also in case text in block is JSON it's parsed and passed to the function as a data object **ignoring other arguments**.

If function has named argument all arguments must be named.

So in general I see two usage scenarios:

First - we have raw js function and want to use it as a tpl helper:
```joy
@Math.pow(7, 2)
```

Second - we want to use a tpl from other one:

```joy
@import * as frame from 'foo/frame'
@import * as fullName from 'bar/fullName'

@frame() {
    @fullName(name=data.name, surname=data.surname)
}
```

or

```joy
@import * as frame from 'foo/frame'
@import * as fullName from 'bar/fullName'

@frame() {
    @fullName() {
        {
            "name": "@data.name",
            "surname": "@data.surname"
        }
    }
}
```

#### Conditions

```joy
@if n < 1 {
    less
}
else if n > 1 && n < 100 {
    in range
}
else {
    more
}
```

#### Loops

```joy
<ul>
    @each item in items {
        <li>@i. Hi @item</li>
    }
<ul>
```

```joy
<ul>
    @each key:value in users {
        <li>@key. Hi @value</li>
    }
<ul>
```

#### Types

Types that can be used in expressions:

* bool
* number
* null
* undefined
* string
* identifier

**OBJECTS AND ARRAYS ARE NOT SUPPORTED YET**

#### Operators

Operators that can be used in expressions:

* unary ! + -
* && ||
* < > <= >= == === != !==
* \+ -
* \* / %

**OTHER OPERATORS ARE NOT SUPPORTED YET**

For more details see example directory.

Enjoy! :)
