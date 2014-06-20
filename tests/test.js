'use strict';
var assert = require('assert');
var fs = require('fs');
var gutil = require('gulp-util');
var path = require('path');
var todo = require('../index');

it('should handle a file with no comments', function (cb) {
    var stream = todo();
    var files = [];

    stream.on('data', function (file) {
        files.push(file);
    }).on('end', function () {
        assert.equal(files.length, 0);
        cb();
    });

    var file = './tests/test.js';
    var testFile = fs.readFileSync(file);
    stream.write(new gutil.File({
        path: file,
        contents: new Buffer(testFile.toString())
    }));

    stream.end();
});

it('should parse a file with comments correctly', function (cb) {
    var stream = todo();

    stream.on('data', function (file) {
        var _filename = path.basename(file.path);
        assert.equal(_filename, 'todo.md');
        assert.ok(/figure out if/.test(file._contents.toString()));
        assert.ok(/index.js/.test(file._contents.toString()));
    }).on('end', cb);

    var file = './index.js';
    var testFile = fs.readFileSync(file);
    stream.write(new gutil.File({
        path: file,
        contents: new Buffer(testFile.toString())
    }));

    stream.end();
});

it('should output to the correct filename', function (cb) {
    var name = 'magic.md';
    var stream = todo({
        fileName: name
    });

    stream.on('data', function (file) {
        assert.equal(path.basename(file.path), name);
    }).on('end', cb);

    var file = './index.js';
    var testFile = fs.readFileSync(file);
    stream.write(new gutil.File({
        path: file,
        contents: new Buffer(testFile.toString())
    }));

    stream.end();
});

it('should work with verbose output', function (cb) {
    var stream = todo({
        verbose: true
    });
    var output = [];

    var write = process.stdout.write;

    process.stdout.write = (function (stub) {
        return function (string) {
            stub.apply(process.stdout, arguments);
            output.push(string);
        };
    })(process.stdout.write);

    stream.on('data', function (file) {
        var _filename = path.basename(file.path);
        assert.equal(_filename, 'todo.md');
        assert.ok(/figure out if/.test(file._contents.toString()));
        assert.ok(/index\.js/.test(file._contents.toString()));
    }).on('end', function () {
        //restore write
        process.stdout.write = write;
        output = output.join('\n');
        assert(/TODO/.test(output));
        assert(/index\.js/.test(output));
        cb();
    });

    var file = './index.js';
    var testFile = fs.readFileSync(file);

    stream.write(new gutil.File({
        path: file,
        contents: new Buffer(testFile.toString()),
    }));

    stream.end();
});

it('should use custom transformation for header', function (cb) {
    var stream = todo({
        transformHeader: function (kind) {
            return ['### //' + kind];
        }
    });

    stream.on('data', function (file) {
        var contents = file._contents.toString();
        assert(/### \/\/TODO/.test(contents));
    }).on('end', cb);

    var file = './index.js';
    var testFile = fs.readFileSync(file);

    stream.write(new gutil.File({
        path: file,
        contents: new Buffer(testFile.toString())
    }));

    stream.end();
});

it('should use custom transformation for comment', function (cb) {
    var stream = todo({
        transformComment: function (file, line, text) {
            return ['* ' + text + ' (at ' + file + ':' + line + ')'];
        },
    });

    stream.on('data', function (file) {
        var contents = file._contents.toString();
        assert(/\*\s*(\w+\s*)+\s*\(at index.js:[0-9]+\)/.test(contents));
    }).on('end', cb);

    var file = './index.js';
    var testFile = fs.readFileSync(file);

    stream.write(new gutil.File({
        path: file,
        contents: new Buffer(testFile.toString())
    }));

    stream.end();
});

it('should handle a file without a path or extension', function (cb) {
    var stream = todo();

    stream.on('data', function (file) {
        var contents = file._contents.toString();
        assert.ok(/unknown file/.test(contents));
    }).on('end', cb);

    var file = './index.js';
    var testFile = fs.readFileSync(file);

    stream.write(new gutil.File({
        contents: new Buffer(testFile.toString())
    }));

    stream.end();
});

it('should throw if got an unsupported file extension', function (cb) {
    var stream = todo();

    stream.on('error', function (err) {
        assert(err);
        assert(/is not supported/.test(err.message));
        cb();
    }).on('end', cb);

    var file = './index.js';
    var testFile = fs.readFileSync(file);

    stream.write(new gutil.File({
        path: './index.unsupported',
        contents: new Buffer(testFile.toString())
    }));

    stream.end();
});
