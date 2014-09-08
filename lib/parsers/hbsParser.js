//test for comments that have todo/fixme + text
var rCommentsValidator = /{{!(?:--)?\s*(todo|fixme)+:?\s*(.+?)\s*(?:--)?}}/mig;

module.exports = function (contents) {
    'use strict';
    var lines = contents.split('\n');

    var comments = [];
    lines.forEach(function (line, index) {
        var match = rCommentsValidator.exec(line);
        while (match) {
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
            match = rCommentsValidator.exec(line);
        }
    });
    return comments;
};
