# [gulp](https://github.com/wearefractal/gulp)-todo
> Parse and output TODOs and FIXMEs from comments in your file in a stream

[![NPM Version](http://img.shields.io/npm/v/gulp-todo.svg?style=flat)](https://npmjs.org/package/gulp-todo)
[![NPM Downloads](http://img.shields.io/npm/dm/gulp-todo.svg?style=flat)](https://npmjs.org/package/gulp-todo)
[![Build Status](http://img.shields.io/travis/pgilad/gulp-todo.svg?style=flat)](https://travis-ci.org/pgilad/gulp-todo)

Parse your files in a gulp-stream, extracting todos/fixmes from comments and reporting them
in a reporter to your choosing using [leasot](https://github.com/pgilad/leasot).

Issues with the output should be reported on the [leasot issue tracker](https://github.com/pgilad/leasot/issues)

## Install

Install with [npm](https://npmjs.org/package/gulp-todo)

```sh
$ npm install --save-dev gulp-todo
```

## Usage

```js
const gulp = require('gulp');
const todo = require('gulp-todo');

// generate a todo.md from your javascript files
gulp.task('todo', function() {
    gulp.src('js/**/*.js')
        .pipe(todo())
        .pipe(gulp.dest('./'));
        // -> Will output a TODO.md with your todos
});

// generate todo from your jade files
gulp.task('todo-jade', function() {
    gulp.src('partials/**/*.jade')
        .pipe(todo({ fileName: 'jade-todo.md' }))
        .pipe(gulp.dest('./'));
        // -> Will output a jade-todo.md with your todos
});

// get filenames relative to project root (where your gulpfile is)
gulp.task('todo-absolute', function() {
    gulp.src('js/**/*.js')
        .pipe(todo({
            absolute: true
        }))
        .pipe(gulp.dest('./'));
});

// get relative path filenames
gulp.task('todo-absolute', function() {
    gulp.src('js/**/*.js', { base: '/' })
        .pipe(todo())
        .pipe(gulp.dest('./'));
});

// create a json output of the comments (useful for CI such as jenkins)
gulp.task('todo-json', function () {
    gulp.src('./**/*.js', {
        base: './'
    })
        .pipe(todo({
            fileName: 'todo.json',
            reporter: 'json'
        }))
        .pipe(gulp.dest('./'));
});

// output once in markdown and then output a json file as well
gulp.task('todo-reporters', function() {
    gulp.src('js/**/*.js')
        .pipe(todo())
        .pipe(gulp.dest('./')) //output todo.md as markdown
        .pipe(todo.reporter('json', {fileName: 'todo.json'}))
        .pipe(gulp.dest('./')) //output todo.json as json
});


// Delete the todo.md file if no todos were found
const gulpIf = require('gulp-if');
const del = require('del');
const vinylPaths = require('vinyl-paths');

gulp.task('todo-delete', function() {
    gulp.src('js/**/*.js')
        .pipe(todo())
        .pipe(gulpIf(function (file) {
            return file.todos && Boolean(file.todos.length);
        }, gulp.dest('./'), vinylPaths(del)));
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
const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const todo = require('gulp-todo');
const template = require('lodash.template');
const through = require('through2');

gulp.task('default', function () {
    gulp.src('./js/**/*.js')
        .pipe(todo())
        .pipe(through.obj(function (file, enc, cb) {
            //read and interpolate template
            const tmpl = fs.readFileSync('./readme.md.template', 'utf8');
            const compiledTpl = template(tmpl);
            const newContents = compiledTpl({
                'marker': file.contents.toString()
            });
            //change file name
            file.path = path.join(file.base, 'readme-new.md');
            //replace old contents
            file.contents = Buffer.from(newContents);
            //push new file
            this.push(file);
            cb();
        }))
       .pipe(gulp.dest('./'));
});
```

## Supported Filetypes

See https://github.com/pgilad/leasot#supported-languages

## API

### todo(options)

`options` is an optional configuration object, see https://github.com/pgilad/gulp-todo/blob/master/index.js#L22-L32

### todo.reporter(reporter, options)

`options` is an optional configuration object, see https://github.com/pgilad/gulp-todo/blob/master/lib/reporter.js#L10-L16

Use another reporter in stream, will replace the contents of the output file.
Must be used after `todo()`, since it uses the `file.todos` that are passed along.

See the example in the [usage](#usage)

## License

MIT @[Gilad Peleg](http://giladpeleg.com)
