'use strict';

var gutil = require('gulp-util');
var through = require('through2');
var esprima = require('esprima');
var path = require('path');

//test for comments that have todo/fixme + text
var rCommentsValidator = /^(\W)*(TODO|FIXME)+(?:\s)*?(?:\S)+/i;
//split todo/fixme comments
var rCommentsSplit = /(TODO|FIXME):?/i;
var rVar = '\\$\\{\\s*_\\s*\\}';
var rAlphaVar = new RegExp(rVar.replace('_', '([a-z]+)'), 'gi');
var rKindVar = new RegExp(rVar.replace('_', 'kind'), 'gi');

var isVerbose = false;

var defaultHeaderTemplate = '### ${kind}s\n| Filename | line # | todo\n';
var defaultCommentTemplate = '${file} | ${line} | ${text}';

/**
 * logCommentsToConsole
 * logs an array of comments as formatted text to console
 *
 * @param {Array} comments - the comments array
 */
var logCommentsToConsole = function (comments) {
    comments.forEach(function (comment) {
        var isTodo = /todo/i.test(comment.kind);
        //log comment type and text
        gutil.log(isTodo ? gutil.colors.cyan(comment.kind) : gutil.colors.magenta(comment.kind), comment.text);
        //log comment file and line
        gutil.log(gutil.colors.gray(comment.file + ':' + comment.line));
    });
};

/**
 * generateContents
 * generates the markdown output
 * TODO export to a lib ~author
 *
 * @param comments
 * @param newLine
 * @return
 */
var generateContents = function (comments, config) {
    var output, kind, header;

    output = {};

    comments.forEach(function (comment) {
        var commentOut;

        commentOut = config.commentTemplate.replace(rAlphaVar, function(match, key) {
            return comment[key] || match;
        }).replace('\\n', '\n');

        if (!output[comment.kind]) {
            output[comment.kind] = [];
        }

        output[comment.kind].push(commentOut);
    });

    var contents = '';

    for(kind in output) {
        header = config.headerTemplate.replace(rKindVar, kind);

        contents += header + config.newLine + output[kind].join(config.newLine);
    }

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
    var _path = this.path || 'unknown file';
    var _file = _path.replace(this.cwd + path.sep, '');
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

    //fail safe return
    if (!ast || !ast.comments || !ast.comments.length) {
        return comments;
    }

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

    var returnObj = comments.map(mapCommentObject, file);
    //if verbose - log comments
    if (isVerbose) {
        logCommentsToConsole(returnObj);
    }
    return returnObj;
};

module.exports = function (params) {
    params = params || {};
    //target filename
    var fileName = params.fileName || 'todo.md';
    //first file to capture cwd
    var firstFile;
    var comments = [];
    var config = {
        newLine: params.newLine || gutil.linefeed,
        headerTemplate: params.header || defaultHeaderTemplate,
        commentTemplate: params.comment || defaultCommentTemplate
    };
    //set verbose mode - log comments
    isVerbose = params.verbose || false;

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
            var contents = generateContents(comments, config);
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
