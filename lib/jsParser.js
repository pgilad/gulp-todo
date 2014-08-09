var esprima = require('esprima');

//test for comments that have todo/fixme + text
var rCommentsValidator = /^\W*(TODO|FIXME)+:?\s+?(.+)+/i;

/**
 * parse
 * returns an array of comments generated from this file
 * TODO extract this function to a separate module
 *
 * @param {Object} file vinyl file in stream
 * @return
 */
module.exports = function (contents) {
    'use strict';
    var ast;
    try {
        ast = esprima.parse(contents, {
            tolerant: true,
            comment: true,
            loc: true
        });
    } catch (err) {
        err.message = 'gulp-todo: ' + err.message;
        this.emit('error', 'parsing error' + err);
    }

    var comments = [];
    //fail safe return
    if (!ast || !ast.comments || !ast.comments.length) {
        return comments;
    }

    ast.comments.forEach(function (comment) {
        comment.value.split('\n').forEach(function (item) {
            var match = item.match(rCommentsValidator);
            if (!match || !match.length) {
                return;
            }
            if (!match[1] && !match[2]) {
                return;
            }
            comments.push({
                kind: match[1].toUpperCase(),
                value: match[2].trim(),
                line: comment.loc.start.line
            });
        });
    });

    return comments;
};
