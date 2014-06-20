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

Specify the output filename.

**Type**: `String`

**Default**: `todo.md`

### newLine

How to separate lines in the output file. Defaults to your OS's default line separator.

**Type**: `String`

**Default**: `\n`

### verbose

Output comments to console as well.

**Type**: `Boolean`

**Default**: `false`

### transformHeader

Control the output of a header for each comment kind (*i.e todo, fixme*).

**Type**: `Function`

**Default**:
```js
function (kind) {
    return ['### ' + kind + 's',
        '| Filename | line # | todo',
        '|:--------:|:------:|:------:'];
}
```

**Params**: `transformHeader(kind)`

**kind**: will be be passed as the comment kind (todo/fixme).

**Returns**: `String[]|String`

You are expected to return either an `Array of strings` or just a `string`. If you return an array - each item will be separated by a newline in the output.

### transformComment

Control the output for each comment.

**Type**: `Function`

**Default**:
```js
function (file, line, text) {
    return ['| ' + file + ' | ' + line + ' | ' + text];
}
```

**Params**: `transformComment(file, line, text, kind)`

**file**: filename in comment was in.

**line**: line of comment.

**text**: comment text

**kind**: will be be passed as the comment kind (todo/fixme).

**Returns**: `String[]|String`

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
