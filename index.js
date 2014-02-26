'use strict';
var gutil = require('gulp-util');
var through = require('through2');
var esprima = require('esprima');
var path = require('path');

//test for comments that have todo/fixme + text
var rCommentsValidator = /^(\W)*(TODO|FIXME)+(?:\s)*?(?:\S)+/i;
//split todo/fixme comments
var rCommentsSplit = /(TODO|FIXME):?/i;

/**
 * generateContents
 * generates the markdown output
 * TODO export to a lib
 *
 * @param comments
 * @param newLine
 * @return
 */
var generateContents = function (comments, newLine) {
    var output = {
        TODO: '',
        FIXME: ''
    };

    comments.forEach(function (comment) {
        output[comment.kind] += '| ' + comment.file + ' | ' + comment.line + ' | ' + comment.text + newLine;
    });

    var contents;

    contents = '### TODOs' + newLine;
    contents += '| Filename | line # | todo' + newLine;
    contents += '|:--------:|:------:|:------:' + newLine;
    contents += output.TODO + newLine + newLine;

    contents += '### FIXMEs' + newLine;
    contents += '| Filename | line # | fixme' + newLine;
    contents += '|:--------:|:------:|:------:' + newLine;
    contents += output.FIXME;

    return contents;
};

/**
 * mapCommentObject
 *
 * @param comment
 * @return
 */
//TODO export a to a lib
var mapCommentObject = function (comment) {
    //get splitted comment
    var _splitted = comment.value.trim().split(rCommentsSplit);
    //get relative file name
    var _file = this.path.replace(this.cwd + path.sep, '');
    //get comment text
    var _text = _splitted[2].trim();
    //get comment kind
    var _kind = _splitted[1].trim().toUpperCase();
    //get comment line
    var _line = comment.line;

    return {
        file: _file,
        text: _text,
        kind: _kind,
        line: _line
    };
};

/**
 * getCommentsFromAst
 * returns an array of comments generated from this file
 * TODO export this to a lib
 *
 * @param ast
 * @param file
 * @return
 */
var getCommentsFromAst = function (ast, file) {
    var comments = [];
    ast.comments.forEach(function (comment) {
        var splittedComment = comment.value.split('\n');
        var results = splittedComment.filter(function (item) {
            return rCommentsValidator.test(item);
        });
        if (results && results.length) {
            results = results.map(function (i) {
                return {
                    value: i,
                    line: comment.loc.start.line
                };
            });
            comments = comments.concat(results);
        }
    });
    if (!comments || !comments.length) {
        return [];
    }

    return comments.map(mapCommentObject, file);
};

module.exports = function (params) {
    params = params || {};
    //target filename
    var fileName = params.fileName || 'todo.md';
    //first file to capture cwd
    var firstFile;
    //newline separator
    var newLine = params.newLine || gutil.linefeed;
    var comments = [];

    /* main object iteration */
    return through.obj(function (file, enc, cb) {
            if (file.isNull()) {
                //if file is null
                this.push(file);
                return cb();
            }

            if (file.isStream()) {
                this.emit('error', new gutil.PluginError('gulp-todo', 'Streaming not supported'));
                return cb();
            }

            var ast;

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

            //assign first file to get relative cwd/path
            if (!firstFile) {
                firstFile = file;
            }

            //todo better rename
            comments = comments.concat(getCommentsFromAst(ast, file));

            return cb();
        },
        function (cb) {
            if (!firstFile || !comments.length) {
                return cb();
            }

            //get generated output
            var contents = generateContents(comments, newLine);
            //build stream file
            var mdFile = new gutil.File({
                cwd: firstFile.cwd,
                base: firstFile.cwd,
                path: path.join(firstFile.cwd, fileName),
                contents: new Buffer(contents)
            });

            //push file
            this.push(mdFile);
            return cb();
        });
};
