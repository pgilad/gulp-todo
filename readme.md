# [gulp](https://github.com/wearefractal/gulp)-todo
> Generate a TODO.md file from your javascript todos and fixmes

[![NPM Version](http://img.shields.io/npm/v/gulp-todo.svg)](https://npmjs.org/package/gulp-todo)
[![NPM Downloads](http://img.shields.io/npm/dm/gulp-todo.svg)](https://npmjs.org/package/gulp-todo)
[![Dependencies](http://img.shields.io/gemnasium/pgilad/gulp-todo.svg)](https://gemnasium.com/pgilad/gulp-todo)
[![Build Status](https://travis-ci.org/pgilad/gulp-todo.svg?branch=master)](https://travis-ci.org/pgilad/gulp-todo)

Parse all your javascript files through Esprima, and generate a todo.md

## Install

Install with [npm](https://npmjs.org/package/gulp-todo)

```
npm install --save-dev gulp-todo
```

## Example

```js
var gulp = require('gulp');
var todo = require('gulp-todo');

gulp.task('default', function() {
    gulp.src('js/**/*.js')
        .pipe(todo())
        .pipe(gulp.dest('./'));
});
```

## Options

Options can be passed along as an object containing the following fields:

#### filename

`{String}` - specify the output filename. defaults to `todo.md`.

#### newLine

`{String}` - how to seperate lines in the output file. Defaults to your OS's default line separator (usually `\n`)

#### logToConsole

`{Boolean}` - also log the output to the console. defaults to `true`.

### Example Options using defaults:

```js
//...
.pipe(todo({
    fileName: 'todo.md',
    newLine: '\n',
    logToConsole: true
}))
//...
```

## License

MIT ©2014 **Gilad Peleg**
