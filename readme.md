# Joy

Template engine we use in [Triggre](https://triggre.com/).

_This is an early release, use it at your own risk._

Summary:
1. razor like syntax
2. precompilation oriented
3. templates are modules
4. templates and helpers are functions
5. clear names collision solving
6. compression in mind

## Usage

### Bash

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

### Express

**U can't use imports within express views.** If u really need it plz use precompilation instead.

```js
app.set('view engine', 'joytpl');
```

To avoid suffix:
```js
const joy = require('joytpl');

// ...

app.engine('joy', joy.express);
app.set('view engine', 'joy');

// ...
```

### Code

```js
const joy = require('joytpl');

joy.build(inputText, options, function(err, data) {
    if (err) {
        console.error(err);
        return;
    }

    // data.content - result text
    // data.extracted - object that contains all extractions
});
```
Beyond same options available in bash there some advanced ones:
```
{
    ...
    extractors: {NodeType: [fn1, fn2], ...},
    validators: {NodeType: [fn3], ...}
    
    // where fnN(node, exported, options) {...}
}
```
You can add custom extractors or validators to specific AST node type.  
Want to forbid some variables names or extract all l10n text to single JSON file? No problem.

### Dev Tools

* [gulp-joy](https://www.npmjs.com/package/gulp-joy)
* [sublime-joy](https://github.com/homobel/sublime-joy)

## Syntax

#### Comments

```joy
@* you will never recall what this code is for *@
```

#### Imports

```joy
@import * as foo from 'bar/foo' 
@import zop from 'bar/zop'
```
Currently it's the only syntax supported.

Based on modules option it goes to:
```js
import * as foo from 'bar/foo';
const foo = require('bar/foo');
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
@data.htmlEscaped @* escape utility by default *@
@!data.htmlRaw @* raw html *@

@data.foo.boo.htmlEscaped  @* with namespace *@
@!data.foo.boo.htmlRaw

@(data.hello)world together @* with borders *@
@!(data.hello)again
```

#### Functions

Arguments in functions are expressions with any supported types.

```joy
@foo.fn(100.1 + 1, null, undefined, true, "foo", name='foo', !isEmpty, gag(false, 2312) {
    <h1>@title</h1>
})
```

Here _name='foo'_ is named argument.

Unlike in js, **block after function is also function's named argument**(it's reserved name - content). Treat it as an easy form of passing big chunk of text.  
Also in case text in block is JSON it's parsed and passed to the function as a data object **ignoring other arguments**.

If function has named argument all arguments must be named.

So in general there are two usage scenarios:

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

Put parentheses to distinguish functions bodies from conditional:

```
@if foo() {
    @* function body *@
} {
    @* conditional body *@
}
```

```
@if (bar()) {
    @* conditional body *@
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

**Objects and arrays are not supported yet.**

#### Operators

Operators that can be used in expressions:

* unary ! + -
* && ||
* < > <= >= == === != !==
* \+ -
* \* / %

**Other operators are not supported yet.**

For more details see example directory.

Enjoy! :)
