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

Installation
```bash
npm i -g joytpl

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

* modules: es6, commonjs, amd
* jsVersion: es5, es6

Write result in an output file
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
    
    // result usage
    
});
```

## Syntax

#### Comments

```joy
@* comment goes to "" *@
```

#### Imports

```joy
@import * as foo from 'bar/foo' 

@*
    based on modules option goes to:
    import * as foo from 'bar/foo'
    var foo = require('bar/foo');
    define([..., 'bar/foo'], function(..., foo) {});
*@
```

#### Escape

Start char escape

```joy
@@ @* goes to @ *@
```

Escape unpaired brackets in blocks

```joy
... {
    \} @* goes to } *@
    \{ @* goes to { *@
}
```

Paired brackets may be unescaped

#### Variables

```joy
@htmlEscaped @* -> escape utility by default *@
@!htmlRaw @* -> raw *@

@foo.boo.htmlEscaped  @* with namespace *@
@!foo.boo.htmlRaw

@(hello)world together @* with borders *@
@!(hello)again
```

All variables passed in a tpl function via object can be used with data prefix like:
```joy
Hello, @data.name!
```

#### Functions

Arguments in functions are expressions with any supported types.

```joy
@foo.fn(100 + 1, 99.23, null, true, false, "foo", 'foo', name='foo', lastname, gag(false, 2312) {
    <span>@lol</span>
})
```

name='foo' named argument.

Unlike in js, **BLOCK AFTER FUNCTION IS ALSO FUNCTION'S NAMED ARGUMENT**(it's reserved name - content). Treat it as an easy form of passing big chunk of text.
Also in case text in block is JSON it's parsed and passed to the function as a data object ignoring other arguments.

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

@* OR *@

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
@if a < 1 {
    Less
}
else if a > 1 && a < 100 {
    In range
}
else {
    More
}
```

#### Loops

```joy
@each item in items {
    <span>@i. Hi @item</span>
}

@each key:value in users {
    <span>@key. Hi @value</span>
}
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

* unary !+-
* && ||
* < > <= >= == === != !==
* +-
* \* / %

**OTHER OPERATORS ARE NOT SUPPORTED YET**

Enjoy! :)
