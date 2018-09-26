/* global describe,it */
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const Vinyl = require('vinyl');
const todo = require('../index');

const streamFile = function(filename, stream) {
    const file = fs.readFileSync(filename);
    stream.write(
        new Vinyl({
            path: filename,
            contents: Buffer.from(file.toString()),
        })
    );

    stream.end();
};

describe('gulp-todo streaming', function() {
    it('should output empty file when getting file with no comments', function(cb) {
        const stream = todo();
        const files = [];

        const expected = fs.readFileSync('./tests/expected/empty.md', 'utf8').trim();
        stream
            .on('data', function(file) {
                assert.equal(file.contents.toString(), expected);
                files.push(file);
            })
            .on('end', function() {
                assert.equal(files.length, 1, 'Make sure only 1 file was outputted');
                cb();
            });

        streamFile('./tests/stream-spec.js', stream);
    });

    it('should parse a file with comments correctly', function(cb) {
        const stream = todo();

        stream
            .on('data', function(file) {
                const _filename = path.basename(file.path);
                assert.equal(_filename, 'TODO.md');
                assert.ok(/Do something/.test(file._contents.toString()));
                assert.ok(/coffee.coffee/.test(file._contents.toString()));
            })
            .on('end', cb);

        streamFile('./tests/fixtures/coffee.coffee', stream);
    });

    it('should output to the correct filename', function(cb) {
        const name = 'magic.md';
        const stream = todo({
            fileName: name,
        });

        stream
            .on('data', function(file) {
                assert.equal(path.basename(file.path), name);
            })
            .on('end', cb);

        streamFile('./index.js', stream);
    });

    it('should work with verbose output', function(cb) {
        const stream = todo({
            verbose: true,
        });
        const output = [];

        const write = process.stdout.write;
        process.stdout.write = (function(stub) {
            return function(string) {
                stub.apply(process.stdout, arguments);
                output.push(string);
            };
        })(process.stdout.write);

        stream
            .on('data', function(file) {
                const _filename = path.basename(file.path);
                assert.equal(_filename, 'TODO.md');
                assert.ok(/Do something/.test(file._contents.toString()));
                assert.ok(/coffee.coffee/.test(file._contents.toString()));
            })
            .on('end', function() {
                //restore write
                process.stdout.write = write;
                let result = output.join('\n');
                assert(/TODO/.test(result));
                assert(/coffee.coffee/.test(result));
                cb();
            });

        streamFile('./tests/fixtures/coffee.coffee', stream);
    });

    it('should use custom transformation for header', function(cb) {
        const stream = todo({
            reportOptions: {
                transformHeader: function(kind) {
                    return ['### //' + kind];
                },
            },
        });

        stream
            .on('data', function(file) {
                const contents = file._contents.toString();
                assert(/### \/\/TODO/.test(contents));
            })
            .on('end', cb);

        streamFile('./index.js', stream);
    });

    it('should use custom transformation for comment', function(cb) {
        const stream = todo({
            reportOptions: {
                transformComment: function(file, line, text) {
                    return ['* ' + text + ' (at ' + file + ':' + line + ')'];
                },
            },
        });

        stream
            .on('data', function(file) {
                const contents = file._contents.toString();
                assert(/\*\s*(\w+\s*)+\s*\(at.*coffee.coffee:[0-9]+\)/.test(contents));
            })
            .on('end', cb);

        streamFile('./tests/fixtures/coffee.coffee', stream);
    });

    it('should throw if got an unsupported file extension', function(cb) {
        const stream = todo();

        stream
            .on('error', function(err) {
                assert(err);
                assert(/is not supported/.test(err.message));
                cb();
            })
            .on('end', cb);

        const file = './index.js';
        const testFile = fs.readFileSync(file);

        stream.write(
            new Vinyl({
                path: './index.unsupported',
                contents: Buffer.from(testFile.toString()),
            })
        );

        stream.end();
    });

    it('should skip on unsupported files when skip is true', function(cb) {
        const stream = todo({
            skipUnsupported: true,
        });

        const files = [];

        const expected = fs.readFileSync('./tests/expected/empty.md', 'utf8').trim();
        stream
            .on('data', function(file) {
                assert.equal(file.contents.toString(), expected);
                files.push(file);
            })
            .on('end', function() {
                assert.equal(files.length, 1, 'Make sure only 1 file was outputted');
                cb();
            });

        const file = './index.js';
        const testFile = fs.readFileSync(file);

        stream.write(
            new Vinyl({
                path: './index.unsupported',
                contents: Buffer.from(testFile.toString()),
            })
        );

        stream.end();
    });

    it('should show a message about skipping unsupported files if verbose and skip unsupported is true', function(cb) {
        const stream = todo({
            skipUnsupported: true,
            verbose: true,
        });

        const files = [];

        const expected = fs.readFileSync('./tests/expected/empty.md', 'utf8').trim();
        stream
            .on('data', function(file) {
                assert.equal(file.contents.toString(), expected);
                files.push(file);
            })
            .on('end', function() {
                assert.equal(files.length, 1, 'Make sure only 1 file was outputted');
                cb();
            });

        const file = './index.js';
        const testFile = fs.readFileSync(file);

        stream.write(
            new Vinyl({
                path: './index.unsupported',
                contents: Buffer.from(testFile.toString()),
            })
        );

        stream.end();
    });

    it('should parse a jade file', function(cb) {
        const stream = todo();

        stream
            .on('data', function(file) {
                const _filename = path.basename(file.path);
                assert.equal(_filename, 'TODO.md');
                const contents = file._contents.toString();
                assert.ok(/this is a todo/.test(contents));
                assert.ok(!/THERE this isnt a todo/.test(contents));
                assert.ok(/also should be caught/.test(contents));
            })
            .on('end', cb);

        streamFile('./tests/fixtures/comments.jade', stream);
    });
});
