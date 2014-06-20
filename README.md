# [gulp](https://github.com/wearefractal/gulp)-todo
> Generate a TODO.md file from your javascript todos and fixmes

[![NPM Version](http://img.shields.io/npm/v/gulp-todo.svg?style=flat)](https://npmjs.org/package/gulp-todo)
[![NPM Downloads](http://img.shields.io/npm/dm/gulp-todo.svg?style=flat)](https://npmjs.org/package/gulp-todo)
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

gulp.task('todo', function() {
    gulp.src('js/**/*.js')
        .pipe(todo())
        .pipe(gulp.dest('./'));
});
```

## Options

All options are **optional**, and can be passed along in an **object** with the following properties:

### fileName

**Type**: `String`

**Default**: `todo.md`

Specify the output filename.

### newLine

**Type**: `String`

**Default**: `\n`

How to separate lines in the output file. Defaults to your OS's default line separator.

### verbose

**Type**: `Boolean`

**Default**: `false`

Output comments to console as well.

### transformHeader

**Type**: `Function`

**Default**:
```js
function (kind) {
    return ['### ' + kind + 's',
        '| Filename | line # | todo',
        '|:--------:|:------:|:------:'];
}
```

**Returns**: `String[]|String`

Control the output of a header for each comment kind (*i.e todo, fixme*).

**Params**: `transformHeader(kind)`

**kind** will be be passed as the comment kind (todo/fixme).

You are expected to return either an `Array of strings` or just a `string`. If you return an array - each item will be separated by a newline in the output.

### transformHeader

**Type**: `Function`

**Default**:
```js
function (file, line, text) {
    return ['| ' + file + ' | ' + line + ' | ' + text];
}
```

**Returns**: `String[]|String`

Control the output for each comment.

**Params**: `transformComment(file, line, text, kind)`

**file**: filename in comment was in.

**line**: line of comment.

**text**: comment text

**kind** will be be passed as the comment kind (todo/fixme).

You are expected to return either an `Array of strings` or just a `string`. If you return an array - each item will be separated by a newline in the output.

### Example options using defaults:

```js
//...
.pipe(todo{
	fileName: 'todo.md',
    verbose: false,
    newLine: '\n',
    transformComment: function (file, line, text) {
            return ['| ' + file + ' | ' + line + ' | ' + text];
    },
    transformHeader: function (kind) {
    return ['### ' + kind + 's',
        '| Filename | line # | todo',
        '|:--------:|:------:|:------:'];
    }
})
//...
```

## License

MIT ©2014 **Gilad Peleg**
