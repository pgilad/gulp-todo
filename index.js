'use strict';
var gutil = require('gulp-util');
var through = require('through2');
var esprima = require('esprima');
var path = require('path');

module.exports = function (params) {
    var rCommentsValidator = /(TODO|FIXME)+(\s)*?(\S)+/i;
    var rCommentsSplit = /(TODO|FIXME):?/i;

    params = params || {};
    var fileName = params.fileName || 'todo.md';
    var firstFile;
    var newLine = params.newLine || gutil.linefeed;
    var comments = [];

    /* main object iteration */
    return through.obj(function (file, enc, cb) {
            if (file.isNull()) {
                return cb();
            }

            if (file.isStream()) {
                this.emit('error', new gutil.PluginError('gulp-todo', 'Streaming not supported'));
                return cb();
            }
            var ast;

            //wrap in try catch
            try {
                ast = esprima.parse(file.contents.toString('utf8'), {
                    tolerant: true,
                    comment: true,
                    loc: true
                });
            } catch (err) {
                err.message = 'gulp-todo: ' + err.message;
                this.emit('error', new gutil.PluginError('gulp-todo', err));
            }

            if (!firstFile) {
                firstFile = file;
            }

            //todo better rename
            comments = comments.concat(ast.comments.filter(function (comment) {
                return rCommentsValidator.test(comment.value);
            }).map(function (comment) {
                var _splitted = comment.value.trim().split(rCommentsSplit);
                return {
                    file: file.path.replace(file.cwd + path.sep, ''),
                    text: _splitted[2].trim(),
                    kind: _splitted[1].trim().toUpperCase(),
                    line: comment.loc.start.line
                };
            }));

            cb();
        },
        function (cb) {
            if (!firstFile || !comments.length) {
                return cb();
            }

            var output = {
                TODO: '',
                FIXME: ''
            };

            var contents = '';
            comments.forEach(function (comment) {
                output[comment.kind] += comment.file + ' | ' + comment.line + ' | ' + comment.text + newLine;
            });

            contents = '# TODOs' + newLine;
            contents += 'Filename | line # | value' + newLine;
            contents += output.TODO + newLine + newLine;

            contents += '# FIXMEs' + newLine;
            contents += 'Filename | line # | value' + newLine;
            contents += output.FIXME + newLine + newLine;

            this.push(new gutil.File({
                cwd: firstFile.cwd,
                base: firstFile.cwd,
                path: path.join(firstFile.cwd, fileName),
                contents: new Buffer(contents)
            }));

            cb();
        });
};
