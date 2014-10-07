//test for comments that have todo/fixme + text
//TODO: extract todo+fixme to a variable
var rCommentsValidator = /^\s*(?:\/\/|\/\*)!?\s*(todo|fixme)+:?\s+(.+)+/i;

module.exports = function (contents) {
    'use strict';
    var lines = contents.split('\n');

    var comments = [];
    lines.forEach(function (line, index) {
        var match = line.match(rCommentsValidator);
        if (!match || !match.length) {
            return;
        }
        //verify kind and value exists
        if (!match[1] || !match[2]) {
            return;
        }
        comments.push({
            kind: match[1],
            value: match[2],
            line: index
        });
    });
    return comments;
};
