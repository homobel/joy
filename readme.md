# Joy

Template engine we use in [Triggre](https://triggre.com/).

_This is an early release, use it at your own risk._

Summary:
1. razor like minimal syntax
2. precompilation oriented
3. templates are modules
4. templates and helpers are functions
5. clear names collision solving
6. compression in mind

## Usage

### Bash

```bash
npm i joytpl -g
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

### Express

```bash
npm i joytpl
```

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

**U can't use imports within express views.** If u need imports plz use precompilation. In [Triggre](https://triggre.com/) we use express support just for initial template of SPA which is usually pretty simple.

### Code

```bash
npm i joytpl
```

```js
const joy = require('joytpl');

joy.build(inputText, options, function(err, result) {
    if (err) {
        console.error(err);
        return;
    }

    // result.content - result text of the module
    // result.extracted - object that contains all extractions
});
```
Beyond same options available in bash there are advanced ones:
```
{
    extractors: {NodeType: [(node, exported, options) => {...}], ...},
    validators: {NodeType: [(node, exported, options) => {...}], ...}
}
```
You can add custom extractors or validators to specific AST node type(look processor module for the types).  
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
@import foo from 'bar/foo'
```
Two exact import types currently supported.

Based on _modules_ option it goes to:
```js
import * as foo from 'bar/foo';
const foo = require('bar/foo');
define(['bar/foo'], function(foo) {});
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
@!data.foo.htmlRaw @* raw html *@

@(data.hello)world together @* with borders *@
@!(data.hello)again
```

#### Functions

```joy
@formField(additionalClasses='size-' + data.size) {
    <input type="text" name="fullName" />
}
```

Joy has function calls not function definitions. Arguments in this calls are expressions with any supported types. Optional block after ")" is also specific argument. Treat it as an easy form of passing big chunk of text(html). It's also so called **named argument**(it has reserved name _content_) like _additionalClasses_ in example.
There is a rule in joy for functions: if u have a single named argument then all arguments in call must be named.

In case text in block is JSON it's parsed and passed to the function as a data object **ignoring other arguments**.

So in general there are two usage scenarios:

We have raw js function(imported or global) and want to use it as a tpl helper:
```joy
@Math.pow(7, 2)
```

We want to use a tpl from other one:

```joy
@import * as card from 'foo/card'
@import * as fullName from 'bar/fullName'

@!card() {
    @fullName(name=data.name, surname=data.surname)
}
```

or

```joy
@import * as card from 'foo/card'
@import * as fullName from 'bar/fullName'

@!card() {
    @fullName() {{
        "name": "@data.name",
        "surname": "@data.surname"
    }}
}
```

#### Conditions

```joy
@if data.n < 1 {
    less
}
else if data.n > 1 && data.n < 100 {
    in range
}
else {
    more
}
```

Put parentheses to distinguish functions bodies from conditional:

```
@if foo() {
    @* function argument *@
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
    @each item in data.items {
        <li>@item</li>
    }
<ul>
```

```joy
<ul>
    @each key:value in data.items {
        <li class="@if key % 2 == 0 {even} else {odd}">@value</li>
    }
<ul>
```

#### Types

Types that can be used in expressions:

* bool(true/false)
* number(1/1.0)
* null
* undefined
* string("q"/'q')
* variable
* function

**Objects and arrays are not supported yet.**

#### Operators

Operators that can be used in expressions:

* unary ! + -
* && ||
* < > <= >= == === != !==
* \+ -
* \* / %

**Other operators are not supported yet.**

For more details see examples directory.

Enjoy! :)
