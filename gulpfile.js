'use strict';
var gulp = require('gulp');
var todo = require('./index');
var wrap = require('gulp-wrap');
var header = require('gulp-header');

gulp.task('xml', function() {
    gulp.src('./**/*.js', {
        base: './',
    })
        .pipe(
            todo({
                fileName: 'todo.xml',
                reporter: 'custom',
                transformComment: function(file, line, text, kind) {
                    return [
                        '<comment file="' + file.replace(/"/g, '"') + '" line="' + line + '" pattern="' + kind + '">',
                        text,
                        '</comment>',
                    ];
                },
                transformHeader: function() {
                    return '';
                },
            })
        )
        .pipe(wrap('<comments xmlns="http://todos.sourceforge.net" version="0.1.0"> <%= contents %></comments>'))
        .pipe(header('<?xml version="1.0" encoding="UTF-8"?>'))
        .pipe(gulp.dest('./'));
});

gulp.task('json', function() {
    gulp.src('./**/*.js', {
        base: './',
    })
        .pipe(
            todo({
                fileName: 'todo.json',
                reporter: 'json',
                absolute: true,
            })
        )
        .pipe(gulp.dest('./'));
});

gulp.task('multiple', function() {
    gulp.src('./**/*.js', {
        base: './',
    })
        .pipe(todo())
        .pipe(gulp.dest('./'))
        .pipe(
            todo.reporter('xml', {
                fileName: 'todo.xml',
            })
        )
        .pipe(gulp.dest('./'));
});

gulp.task('default', function() {
    gulp.src(['./index.js', './lib/**.*.js'], {
        base: './',
    })
        .pipe(todo())
        .pipe(gulp.dest('./'));
});
