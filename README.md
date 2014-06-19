# [gulp](https://github.com/wearefractal/gulp)-todo
> Generate a TODO.md file from your javascript todos and fixmes

[![NPM Version](http://img.shields.io/npm/v/gulp-todo.svg?style=flat)](https://npmjs.org/package/gulp-todo)
[![NPM Downloads](http://img.shields.io/npm/dm/gulp-todo.svg?style=flat)](https://npmjs.org/package/gulp-todo)
[![Dependencies](http://img.shields.io/gemnasium/pgilad/gulp-todo.svg?style=flat)](https://gemnasium.com/pgilad/gulp-todo)
[![Build Status](http://img.shields.io/travis/pgilad/gulp-todo.svg?style=flat)](https://travis-ci.org/pgilad/gulp-todo)

Parse all your javascript files through Esprima, and generate a todo.md

## Install

Install with [npm](https://npmjs.org/package/gulp-todo)

```bash
$ npm install --save-dev gulp-todo
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

### fileName

Type: `String`

Default: `todo.md`

Specify the output filename.

### newLine

Type: `String`

Default: `\n`

How to separate lines in the output file. Defaults to your OS's default line separator.

### verbose

Type: `Boolean`

Default: `false`

Output comments to console as well.

### Example Options using defaults:

```js
//...
.pipe(todo({
    fileName: 'todo.md',
    newLine: '\n',
    verbose: false
}))
//...
```

### Advanced styling

gulp-todo gives you fine-grained control over its output if desired.

```js
//...
.pipe(todo({
    header: '### //${kind}',
    comment: '* ${text} *(at: ${file}**:${line}**)*',
}))
//...
```

## License

MIT ©2014 **Gilad Peleg**
