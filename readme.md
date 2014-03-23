# [gulp](https://github.com/wearefractal/gulp)-todo
> Generate a TODO.md file from your javascript todos and fixmes

[![NPM Version](http://img.shields.io/npm/v/gulp-todo.svg)](https://npmjs.org/package/gulp-todo)
[![Gittip](http://img.shields.io/gittip/pgilad.svg)](https://www.gittip.com/pgilad/)
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

`filename` - contains the output filename. default is: `todo.md`.

`newLine` - How to seperate the lines. defaults to your OS's default line seperator.


#### Example Options:

```js
{
    fileName: 'todo.md',
    newLine: '\n'
}
```

## License

MIT ©2014 **Gilad Peleg**
