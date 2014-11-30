'use strict';
var gulp = require('gulp');
var todo = require('./index');

gulp.task('json', function () {
    gulp.src('./**/*.js', {
        base: './'
    })
        .pipe(todo({
            fileName: 'todo.json',
            reporter: 'json'
        }))
        .pipe(gulp.dest('./'));
});

gulp.task('multiple', function () {
    gulp.src('./**/*.js', {
        base: './'
    })
        .pipe(todo())
        .pipe(gulp.dest('./'))
        .pipe(todo.reporter('xml', {
            fileName: 'todo.xml'
        }))
        .pipe(gulp.dest('./'));
});

gulp.task('default', function () {
    gulp.src(['./index.js', './lib/**.*.js'], {
        base: './'
    })
        .pipe(todo())
        .pipe(gulp.dest('./'));
});
