'use strict';
var assert = require('assert');
var fs = require('fs');
var gutil = require('gulp-util');
var path = require('path');
var todo = require('./index');

it('should handle a file with no comments', function (cb) {
    var stream = todo();
    var files = [];

    stream.on('data', function (file) {
        files.push(file);
    });

    stream.on('end', function () {
        assert.equal(files.length, 0);
        cb();
    });

    var testFile = fs.readFileSync('./test.js');

    stream.write(new gutil.File({
        contents: new Buffer(testFile.toString())
    }));

    stream.end();
});

it('should parse a file with comments correctly', function (cb) {
    var stream = todo();

    stream.on('data', function (file) {
        var _filename = path.basename(file.path)
        assert.equal(_filename, 'todo.md');
        assert.ok(/export to a lib/.test(file._contents.toString()));
        assert.ok(/unknown file/.test(file._contents.toString()));
    });

    stream.on('end', cb);

    var testFile = fs.readFileSync('./index.js');

    stream.write(new gutil.File({
        contents: new Buffer(testFile.toString())
    }));

    stream.end();
});
