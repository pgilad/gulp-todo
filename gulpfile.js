'use strict';
var gulp = require('gulp');
var todo = require('./index');

gulp.task('default', function () {
    gulp.src('index.js')
        .pipe(todo())
        .pipe(gulp.dest('./'));
});
