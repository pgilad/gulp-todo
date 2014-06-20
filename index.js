'use strict';
var path = require('path');
var gutil = require('gulp-util');
var through = require('through2');
var esprima = require('esprima');
var defaults = require('lodash.defaults');

//test for comments that have todo/fixme + text
var rCommentsValidator = /^(\W)*(TODO|FIXME)+(?:\s)*?(?:\S)+/i;
//split todo/fixme comments
var rCommentsSplit = /(TODO|FIXME):?/i;

/**
 * logCommentsToConsole
 * logs an array of comments as formatted text to console
 *
 * @param {Array} comments - the comments array
 */
var logCommentsToConsole = function(comments) {
    comments.forEach(function(comment) {
        var isTodo = /todo/i.test(comment.kind);
        var commentType = isTodo ? gutil.colors.cyan(comment.kind) : gutil.colors.magenta(comment.kind);
        var commentLocation = '@' + gutil.colors.gray(comment.file + ':' + comment.line);
        gutil.log(commentType, comment.text, commentLocation);
    });
};

/**
 * generateContents
 * generates the markdown output
 * TODO export to a lib ~author
 *
 * @param {Array} comments
 * @param {Object} config
 * @return
 */
var generateContents = function(comments, config) {
    var newLine = config.newLine;
    var transformComment = config.transformComment;
    var transformHeader = config.transformHeader;
    var output = {};

    comments.forEach(function(comment) {
        var kind = comment.kind;
        //initialize kind
        output[kind] = output[kind] || [];
        //transformed comment as an array item
        var transformedComment = transformComment(comment.file, comment.line, comment.text, kind);
        //enforce array type
        if (!Array.isArray(transformedComment)) {
            transformedComment = [transformComment];
        }
        //append to kind array
        output[kind] = output[kind].concat(transformedComment);
    });

    var header;
    var contents = '';
    var kind;

    //prepend headers
    for (kind in output) {
        if (output.hasOwnProperty(kind)) {
            //apply transformation header
            header = transformHeader(kind);
            if (!Array.isArray(header)) {
                header = [header];
            }
            output[kind] = header.concat(output[kind]);
            //keep a margin of blank line from above kind
            if (contents.length) {
                contents += newLine + newLine;
            }
            contents += output[kind].join(newLine);
        }
    }
    return contents;
};

/**
 * mapCommentObject
 *
 * @param {Object} comment
 * @param {Object} file vinyl file in stream
 * @return
 */
//TODO better document mapCommentObject to aid modular parser libs
var mapCommentObject = function(comment, file) {
    //get splitted comment
    var _splitted = comment.value.trim().split(rCommentsSplit);
    //get relative file name
    var _file = (file.path && file.relative) || file.path || 'unknown file';
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
 * parseCommentsJs
 * returns an array of comments generated from this file
 * TODO extract this function to a separate module
 *
 * @param {Object} file vinyl file in stream
 * @return
 */
var parseCommentsJs = function(file) {
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

    var comments = [];
    //fail safe return
    if (!ast || !ast.comments || !ast.comments.length) {
        return comments;
    }

    ast.comments.forEach(function(comment) {
        var splittedComment = comment.value.split('\n');
        var results = splittedComment.reduce(function(arr, item) {
            //if item passes as a todo/fixme comment
            if (rCommentsValidator.test(item)) {
                arr.push({
                    value: item,
                    line: comment.loc.start.line
                });
            }
            return arr;
        }, []);
        comments = comments.concat(results);
    });

    //fixme: perhaps the mappings should be done outside the parser
    return comments.map(function(comment) {
        return mapCommentObject(comment, file);
    });
};

/* list of supported extensions their parsers */
var parsers = {
    '.js': parseCommentsJs
};

module.exports = function(params) {
    params = params || {};
    //assign default params
    var config = defaults(params, {
        fileName: 'todo.md',
        verbose: false,
        newLine: gutil.linefeed,
        transformComment: function(file, line, text) {
            return ['| ' + file + ' | ' + line + ' | ' + text];
        },
        transformHeader: function(kind) {
            return ['### ' + kind + 's',
                '| Filename | line # | todo',
                '|:--------:|:------:|:------:'];
        }
    });

    //verify types
    if (typeof config.transformHeader !== 'function') {
        throw new gutil.PluginError('gulp-todo', 'transformHeader must be a function');
    }
    if (typeof config.transformComment !== 'function') {
        throw new gutil.PluginError('gulp-todo', 'transformComment must be a function');
    }

    var firstFile;
    var comments = [];

    /* main object iteration */
    return through.obj(function(file, enc, cb) {
            //let null files pass through
            if (file.isNull()) {
                this.push(file);
                return cb();
            }
            //can't handle streams for now
            if (file.isStream()) {
                this.emit('error', new gutil.PluginError('gulp-todo', 'Streaming not supported'));
                return cb();
            }

            //assign first file to get relative cwd/path
            if (!firstFile) {
                firstFile = file;
            }

            var fileComments;
            //get extension of file - assume javascript if null
            var ext = path.extname(file.path) || '.js';
            if (parsers[ext]) {
                fileComments = parsers[ext].call(this, file);
            } else {
                var msg = 'File extension ' + gutil.colors.red(ext) + ' is not supported';
                this.emit('error', new gutil.PluginError('gulp-todo', msg));
                return cb();
            }
            //append fileComments object
            comments = comments.concat(fileComments);

            if (config.verbose) {
                logCommentsToConsole(fileComments);
            }
            return cb();
        },
        function(cb) {
            //didn't get any files or have no comments
            if (!firstFile || !comments.length) {
                return cb();
            }
            //build stream file
            var todoFile = new gutil.File({
                cwd: firstFile.cwd,
                base: firstFile.cwd,
                path: path.join(firstFile.cwd, config.fileName),
                contents: new Buffer(generateContents(comments, config))
            });

            //push the todo file
            this.push(todoFile);
            return cb();
        });
};
