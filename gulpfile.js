'use strict';
var gulp = require('gulp');
var todo = require('./index');
var wrap = require('gulp-wrap');

gulp.task('json', function () {
    gulp.src('./**/*.js', {
        base: './'
    })
        .pipe(todo({
            fileName: 'TODO.json',
            padding: 1,
            newLine: ',\n',
            transformHeader: function () {
                return '';
            },
            transformComment: function (file, line, text, kind) {
                return ['{' + '"file": "' + file.replace(/"/g, '\\"') + '"',
                    '"text": "' + text.replace(/"/g, '\\"') + '"',
                    '"kind": "' + kind + '"',
                    '"line": ' + line + '}'];
            }
        }))
        .pipe(wrap('[\n<%= contents %>\n]'))
        .pipe(gulp.dest('./'));
});

gulp.task('default', function () {
    gulp.src(['./index.js', './lib/**.*.js'], {
        base: './'
    })
        .pipe(todo())
        .pipe(gulp.dest('./'));
});
