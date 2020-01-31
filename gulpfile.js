
const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const eslint = require('gulp-eslint');
const glob = require('glob');
const peg = require("pegjs");
const async = require('async');
const ensureDir = require('ensureDir');
const joy = require('./index');

gulp.task('parser', finish => {
    const input = fs.readFileSync(path.join(__dirname, 'grammar/joy.pegjs'), 'utf8');
    const parser = peg.generate(input, {
        output: 'source',
        format: 'commonjs',
        optimize: 'speed'
    });

    fs.writeFileSync(path.join(__dirname, 'lib/generated/parser.js'), parser, 'utf8');
    finish();
});

gulp.task('examples', finish => {
    const base = path.join(__dirname, 'examples/real-world/tpl');

    glob(path.join(base, '**/*.joy'), (err, files) => {
        async.parallel(files.map((file) => {
            return function(fileCb) {
                joy.build(fs.readFileSync(file, 'utf8'), {
                    modules: 'amd',
                    jsVersion: 'es5',
                    runtimePath: 'libs/joy-runtime',
                    shortRuntime: true
                }, function(err, data) {
                    if (err) {
                        fileCb(err);
                        return;
                    }

                    const filePath = path.join(
                        path.join(__dirname, 'examples/real-world/scripts/tpl'),
                        path.normalize(file).replace(base, '').replace('.joy', '.js')
                    );
                    const fileDir = path.dirname(filePath);

                    ensureDir(fileDir, (err) => {
                        if (err) {
                            fileCb(err);
                            return;
                        }

                        fs.writeFileSync(filePath, data.content, 'utf8');
                        fileCb();
                    });
                });
            };
        }), finish)
    });
});

gulp.task('runtime', finish => {
    fs.createReadStream(path.join(__dirname, 'runtime.js'))
        .pipe(fs.createWriteStream(path.join(__dirname, 'examples/real-world/scripts/libs/joy-runtime.js')));

    finish();
});

gulp.task('watch', gulp.series('parser', 'examples', 'runtime', () => {
    gulp.watch('grammar/*.pegjs', gulp.series('parser'));
    gulp.watch('examples/real-world/**/*.joy', gulp.series('examples'));
    gulp.watch('runtime.js', gulp.series('runtime'));
}));

gulp.task('eslint', () => {
    return gulp.src([
        'bin/**/*.js',
        'tests/**/*.js',
        'lib/**/*.js',
        '!lib/generated/**'
    ]).pipe(eslint()).pipe(eslint.format());
});
