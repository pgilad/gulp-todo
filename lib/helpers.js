'use strict';
var gutil = require('gulp-util');

/**
 * logCommentsToConsole
 * logs an array of comments as formatted text to console
 *
 * @param {Array} comments - the comments array
 */
var logCommentsToConsole = function (comments) {
    comments.forEach(function (comment) {
        var isTodo = /todo/i.test(comment.kind);
        var commentType = isTodo ? gutil.colors.cyan(comment.kind) : gutil.colors.magenta(comment.kind);
        var commentLocation = '@' + gutil.colors.gray(comment.file + ':' + comment.line);
        gutil.log(commentType, comment.text, commentLocation);
    });
};

/**
 * generateContents
 * generates the markdown output
 *
 * @param {Array} comments
 * @param {Object} config
 * @return
 */
var generateContents = function (comments, config) {
    var newLine = config.newLine;
    var transformComment = config.transformComment;
    var transformHeader = config.transformHeader;
    var output = {};

    comments.forEach(function (comment) {
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


    if (!comments.length) {
        //add default todo header - it will be empty
        output.TODO = [];
    }

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
var mapCommentObject = function (comment, file) {
    return {
        file: file.path || 'unknown file',
        text: comment.text.trim(),
        kind: comment.kind.toUpperCase(),
        line: comment.line
    };
};

var getMappedComments = function (comments, file) {
    return comments.map(function (comment) {
        return mapCommentObject(comment, file);
    });
};

exports.mapCommentObject = mapCommentObject;
exports.generateContents = generateContents;
exports.logCommentsToConsole = logCommentsToConsole;
exports.getMappedComments = getMappedComments;
