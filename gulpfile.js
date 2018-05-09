const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const glob = require('glob');
const peg = require("pegjs");
const async = require('async');
const prettier = require('prettier');
const ensureDir = require('ensureDir');
const joy = require('./index');

gulp.task('parser', (cb) => {
    const input = fs.readFileSync(path.join(__dirname, 'grammar/joy.pegjs'), 'utf8');
    const parser = peg.generate(input, {
        output: 'source',
        format: 'commonjs',
        optimize: 'speed'
    });

    fs.writeFileSync(path.join(__dirname, 'lib/generated/parser.js'), parser, 'utf8');
    cb();
});

gulp.task('example', (cb) => {
    const base = path.join(__dirname, 'example/tpl');

    glob(path.join(base, '**/*.joy'), (err, files) => {
        async.parallel(files.map((file) => {
            return function(fileCb) {
                joy.build(fs.readFileSync(file, 'utf8'), {
                    modules: 'amd',
                    jsVersion: 'es5',
                    runtimePath: 'joy-runtime',
                    shortRuntime: true
                }, function(err, data) {
                    if (err) {
                        fileCb(err);
                        return;
                    }

                    const filePath = path.join(
                        path.join(__dirname, 'example/scripts/tpl'),
                        path.normalize(file).replace(base, '').replace('.joy', '.js')
                    );
                    const fileDir = path.dirname(filePath);

                    ensureDir(fileDir, (err) => {
                        if (err) {
                            fileCb(err);
                            return;
                        }

                        fs.writeFileSync(filePath, prettier.format(data), 'utf8');
                        fileCb();
                    });


                });
            };
        }), () => {
            cb();
        })
    });
});

gulp.task('runtime', (cb) => {
    fs.createReadStream(path.join(__dirname, 'runtime.js'))
        .pipe(fs.createWriteStream(path.join(__dirname, 'example/scripts/joy-runtime.js')));

    cb();
});

gulp.task('watch', ['parser', 'example', 'runtime'], function() {
    'use strict';

    gulp.watch('grammar/*.pegjs', ['parser']);
    gulp.watch('example/**/*.joy', ['example']);
    gulp.watch('runtime.js', ['runtime']);
});
