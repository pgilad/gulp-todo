var esprima = require('esprima');

//test for comments that have todo/fixme + text
var rCommentsValidator = /^(\W)*(TODO|FIXME)+(?:\s)*?(?:\S)+/i;

/**
 * parseCommentsJs
 * returns an array of comments generated from this file
 * TODO extract this function to a separate module
 *
 * @param {Object} file vinyl file in stream
 * @return
 */
var parseCommentsJs = function (contents) {
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
        var splittedComment = comment.value.split('\n');
        var results = splittedComment.reduce(function (arr, item) {
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

    return comments;
};

module.exports = parseCommentsJs;
