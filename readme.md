# [gulp](https://github.com/wearefractal/gulp)-gulp

> Generate a TODO.md file from your javascript todos and fixmes

Parse all your javascript files through Esprima, and generate a todo.md

## Install

Install with [npm](https://npmjs.org/package/gulp-todo)

```
npm install --save-dev gulp-todo
```

## Example

```js
var gulp = require('gulp');
var todo = require('./index');

gulp.task('default', function() {
    gulp.src('*.js')
        .pipe(todo())
        .pipe(gulp.dest('./'));
});
```

## Options

```js
{
    fileName: 'todo.md',
    newLine: '\n'
}
```

Optionally pass a filename to name the output markdown file.
`fileName`. Default is `todo.md`;

Optionally pass a newline delimiter for the output file. Default is your os's newline.

## License

MIT ©2014 **Gilad Peleg**
