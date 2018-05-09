(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.returnExports = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {

    var entityMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
    };

    function escape(string) {
        return String(string).replace(/[&<>"'`=\/]/g, function fromEntityMap (s) {
            return entityMap[s];
        });
    }

    escape.short = 'e';

    function havValue(value) {
        return value !== undefined;
    }

    havValue.short = 'v';

    function loop(obj, cb) {
        return obj.map(cb).join('');
    }

    loop.short = 'l';

    function print(value) {
        if (value === undefined || value === null) {
            return '';
        }

        return value;
    }

    loop.print = 'p';

    return {
        escape: escape,
        e: escape,
        hasValue: havValue,
        v: havValue,
        loop: loop,
        l: loop,
        print: print,
        p: print
    };
}));
