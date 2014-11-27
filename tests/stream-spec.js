/* global describe,it */
'use strict';
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var gutil = require('gulp-util');
var todo = require('../index');

var streamFile = function (filename, stream) {
    var testFile = fs.readFileSync(filename);
    stream.write(new gutil.File({
        path: filename,
        contents: new Buffer(testFile.toString())
    }));

    stream.end();
};

describe('gulp-todo streaming', function () {
    it('should output empty file when getting file with no comments', function (cb) {
        var stream = todo();
        var files = [];

        var expected = fs.readFileSync('./tests/expected/empty.md', 'utf8').trim();
        stream.on('data', function (file) {
            assert.equal(file.contents.toString(), expected);
            files.push(file);
        }).on('end', function () {
            assert.equal(files.length, 1, 'Make sure only 1 file was outputted');
            cb();
        });

        streamFile('./tests/stream-spec.js', stream);
    });

    it('should parse a file with comments correctly', function (cb) {
        var stream = todo();

        stream.on('data', function (file) {
            var _filename = path.basename(file.path);
            assert.equal(_filename, 'TODO.md');
            assert.ok(/Do something/.test(file._contents.toString()));
            assert.ok(/coffee.coffee/.test(file._contents.toString()));
        }).on('end', cb);

        streamFile('./tests/fixtures/coffee.coffee', stream);
    });

    it('should output to the correct filename', function (cb) {
        var name = 'magic.md';
        var stream = todo({
            fileName: name
        });

        stream.on('data', function (file) {
            assert.equal(path.basename(file.path), name);
        }).on('end', cb);

        streamFile('./index.js', stream);
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
            assert.equal(_filename, 'TODO.md');
            assert.ok(/Do something/.test(file._contents.toString()));
            assert.ok(/coffee.coffee/.test(file._contents.toString()));
        }).on('end', function () {
            //restore write
            process.stdout.write = write;
            output = output.join('\n');
            assert(/TODO/.test(output));
            assert(/coffee.coffee/.test(output));
            cb();
        });

        streamFile('./tests/fixtures/coffee.coffee', stream);
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

        streamFile('./index.js', stream);
    });

    it('should use custom transformation for comment', function (cb) {
        var stream = todo({
            transformComment: function (file, line, text) {
                return ['* ' + text + ' (at ' + file + ':' + line + ')'];
            },
        });

        stream.on('data', function (file) {
            var contents = file._contents.toString();
            assert(/\*\s*(\w+\s*)+\s*\(at.*coffee.coffee:[0-9]+\)/.test(contents));
        }).on('end', cb);

        streamFile('./tests/fixtures/coffee.coffee', stream);
    });

    it('should default to .js extension with no path', function (cb) {
        var stream = todo();

        stream.on('data', function (file) {
            var contents = file._contents.toString();
            assert.ok(/unknown file/.test(contents));
        }).on('end', cb);

        var testFile = fs.readFileSync('./tests/fixtures/jsdoc.js', 'utf8');
        stream.write(new gutil.File({
            contents: new Buffer(testFile)
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

    it('should parse a jade file', function (cb) {
        var stream = todo();

        stream.on('data', function (file) {
            var _filename = path.basename(file.path);
            assert.equal(_filename, 'TODO.md');
            var contents = file._contents.toString();
            assert.ok(/this is a todo/.test(contents));
            assert.ok(!/THERE this isnt a todo/.test(contents));
            assert.ok(/also should be caught/.test(contents));
        }).on('end', cb);

        streamFile('./tests/fixtures/comments.jade', stream);
    });

});
