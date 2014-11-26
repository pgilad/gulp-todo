'use strict';
var gutil = require('gulp-util');
var compact = require('lodash.compact');
var defaults = require('lodash.defaults');

function getConfig(params) {
    //jshint unused:false
    var defaultParams = {
        fileName: 'TODO.md',
        padding: 2,
        verbose: false,
        newLine: gutil.linefeed,
        transformComment: function (file, line, text, kind) {
            return ['| ' + file + ' | ' + line + ' | ' + text];
        },
        transformHeader: function (kind) {
            return ['### ' + kind + 's',
                '| Filename | line # | ' + kind,
                '|:------|:------:|:------'
            ];
        }
    };

    var config = defaults(params || {}, defaultParams);
    if (typeof config.transformHeader !== 'function') {
        throw new Error('gulp-todo', 'transformHeader must be a function');
    }
    if (typeof config.transformComment !== 'function') {
        throw new Error('gulp-todo', 'transformComment must be a function');
    }
    // padding must be a minimum of 0
    // enforce padding to be a number as well
    config.padding = Math.max(0, parseInt(config.padding, 10));
    return config;
}

/**
 * logCommentsToConsole
 * logs an array of comments as formatted text to console
 *
 * @param {Array} comments - the comments array
 */
function logCommentsToConsole(comments) {
    comments.forEach(function (comment) {
        var isTodo = /todo/i.test(comment.kind);
        var commentType = isTodo ? gutil.colors.cyan(comment.kind) : gutil.colors.magenta(comment.kind);
        var commentLocation = '@' + gutil.colors.gray(comment.file + ':' + comment.line);
        gutil.log(commentType, comment.text, commentLocation);
    });
}

function getTransformedComments(comments, transformFn) {
    if (!comments.length) {
        //early return in case of no comments
        //FIXME: make the default header a configurable option
        return {
            TODO: []
        };
    }
    var output = comments.reduce(function (mem, comment) {
        var kind = comment.kind;
        mem[kind] = mem[kind] || [];
        // transformed comment as an array item
        var transformedComment = transformFn(comment.file, comment.line, comment.text, kind);
        // enforce array type
        if (!Array.isArray(transformedComment)) {
            transformedComment = [transformedComment];
        }
        // append to kind array
        mem[kind] = mem[kind].concat(transformedComment);
        return mem;
    }, {});
    return output;
}

/**
 * generateContents
 * generates the markdown output
 *
 * @param {Array} comments
 * @param {Object} config
 * @return
 */
function generateContents(comments, config) {
    var padding = config.padding;
    var newLine = config.newLine;
    var transformComment = config.transformComment;
    var transformHeader = config.transformHeader;
    var header;
    var contents = '';

    var output = getTransformedComments(comments, transformComment);

    //prepend headers
    Object.keys(output).forEach(function (kind) {
        header = transformHeader(kind);
        // enforce array response
        if (!Array.isArray(header)) {
            header = [header];
        }
        output[kind] = compact(header.concat(output[kind]));
        // add padding between kind blocks
        if (contents.length) {
            contents += new Array(padding + 1).join(newLine);
        }
        contents += output[kind].join(newLine);
    });

    return contents;
}

/**
 * mapCommentObject
 *
 * @param {Object} comment
 * @param {Object} file vinyl file in stream
 * @return
 */
//TODO: better document mapCommentObject to aid modular parser libs
function mapCommentObject(comment, file) {
    return {
        file: file.path || 'unknown file',
        text: comment.text.trim(),
        kind: comment.kind.toUpperCase(),
        line: comment.line
    };
}

function getMappedComments(comments, file) {
    return comments.map(function (comment) {
        return mapCommentObject(comment, file);
    });
}

exports.mapCommentObject = mapCommentObject;
exports.generateContents = generateContents;
exports.logCommentsToConsole = logCommentsToConsole;
exports.getMappedComments = getMappedComments;
exports.getConfig = getConfig;
