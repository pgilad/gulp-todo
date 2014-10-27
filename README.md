# [gulp](https://github.com/wearefractal/gulp)-todo
> Generate a TODO.md file from comments of files in stream

[![NPM Version](http://img.shields.io/npm/v/gulp-todo.svg?style=flat)](https://npmjs.org/package/gulp-todo)
[![NPM Downloads](http://img.shields.io/npm/dm/gulp-todo.svg?style=flat)](https://npmjs.org/package/gulp-todo)
[![Build Status](http://img.shields.io/travis/pgilad/gulp-todo.svg?style=flat)](https://travis-ci.org/pgilad/gulp-todo)

Parse files from a stream, extract todos/fixmes from comments and output a markdown file.

## Install

Install with [npm](https://npmjs.org/package/gulp-todo)

```bash
$ npm install --save-dev gulp-todo
```

## Usage

```js
var gulp = require('gulp');
var todo = require('gulp-todo');

//generate a todo.md from your javascript files
gulp.task('todo', function() {
    gulp.src('js/**/*.js')
        .pipe(todo())
        .pipe(gulp.dest('./'));
        // -> Will output a TODO.md with your todos
});

//generate todo from your jade files
gulp.task('jade-todo', function() {
    gulp.src('partials/**/*.jade')
        .pipe(todo({
                fileName: 'jade-todo.md'
            }))
        .pipe(gulp.dest('./'));
});
```

#### Injecting the todo generated file into another template

If you want to inject the generated todo stream into another file (say a `readme.md.template`)
you can do the following:

- Create `readme.md.template` file that contains the following marker, marking where you want to inject the generated todo file:

```md
### some previous content
<%= marker %>
```

- Use the following code to inject into that markdown, creating a markdown file with the generated todo:

```js
var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var todo = require('gulp-todo');
var template = require('lodash.template');
var through = require('through2');

gulp.task('default', function () {
    gulp.src('./js/**/*.js')
        .pipe(todo())
        .pipe(through.obj(function (file, enc, cb) {
            //read and interpolate template
            var newContents = template(fs.readFileSync('./readme.md.template'), {
                marker: file.contents.toString()
            });
            //change file name
            file.path = path.join(file.base, 'readme-new.md');
            //replace old contents
            file.contents = new Buffer(newContents);
            //push new file
            this.push(file);
            cb();
        }))
       .pipe(gulp.dest('./'));
});
```

## Supported Filetypes

| Filetype     | Extension       | Notes                                           |
| ------------ | --------------- | ------------------------------------------------|
| Handlebars   | `.hbs`          | using regex. Supports `{{! }}` and `{{!-- --}}` |
| Jade         | `.jade`         | Using regex                                     |
| Javascript   | `.js`           | Using regex. Supports `// and /* */` comments   |
| Sass         | `.sass` `.scss` | using regex. Supports `// and /* */` comments.  |
| Stylus       | `.styl`         | using regex. Supports `// and /* */` comments.  |
| Typescript   | `.ts`           | using regex. Supports `// and /* */` comments.  |

Javascript is the default parser.

**PRs for additional filetypes is welcomed!!**

## API

`todo(params)`

`params` is an optional object, that may contain the following properties:

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

### transformHeader(kind)

Control the output of a header for each comment kind (*i.e todo, fixme*).

**Type**: `Function`

**Default**:
```js
function (kind) {
    return ['### ' + kind + 's',
        '| Filename | line # | todo',
        '|:------|:------:|:------'
    ];
}
```

**kind**: will be be passed as the comment kind (todo/fixme).

**Returns**: `String[]|String`

You are expected to return either an `Array of strings` or just a `string`. If you return an array - each item will be separated by a newline in the output.

### transformComment(file, line, text, kind)

Control the output for each comment.

**Type**: `Function`

**Default**:
```js
function (file, line, text) {
    return ['| ' + file + ' | ' + line + ' | ' + text];
}
```

**file**: filename the comment was in.

**line**: line of comment.

**text**: comment text

**kind**: will be be passed as the comment kind (todo/fixme).

**Returns**: `String[]|String`

You are expected to return either an `Array of strings` or just a `string`. If you return an array - each item will be separated by a newline in the output.

## Usage using all default options

```js
//...
.pipe(todo{
    fileName: 'todo.md',
    verbose: false,
    newLine: gutil.linefeed,
    transformComment: function (file, line, text) {
        return ['| ' + file + ' | ' + line + ' | ' + text];
    },
    transformHeader: function (kind) {
        return ['### ' + kind + 's',
            '| Filename | line # | todo',
            '|:------|:------:|:------'
        ];
    }
})
//...
```

## License

MIT @[Gilad Peleg](http://giladpeleg.com)
