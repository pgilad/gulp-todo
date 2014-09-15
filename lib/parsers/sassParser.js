'use strict';
//test for comments that have todo/fixme + text
var rLineComment = /\/\/\s*(todo|fixme):?\s*([^\r\n]+)+/gi;
var rBlockComment = /\/\*(?:[\s\S]*?)\*\//gmi;
var rInnerBlock = /[\n\r\s]*?(todo|fixme)?:(.+)\s*/gi;

//get line number from pos
var getLineFromPos = function (str, pos) {
    return str.substr(0, pos).match(/[\n\r]/g).length + 1;
};

module.exports = function (contents) {
    var comments = [];
    var index;

    //look for line comments
    var match = rLineComment.exec(contents);
    while (match) {
        if (!match || !match.length) {
            return;
        }
        // verify kind and value exists
        if (!match[1] || !match[2]) {
            return;
        }
        index = match.index;
        comments.push({
            kind: match[1],
            value: match[2],
            line: getLineFromPos(contents, index)
        });
        match = rLineComment.exec(contents);
    }

    //look for block comments
    match = rBlockComment.exec(contents);
    while (match) {
        if (!match || !match.length) {
            return;
        }
        //use first match as basis to look into todos/fixmes
        var baseMatch = match[0];
        //find inner matches
        var subMatch = rInnerBlock.exec(baseMatch);
        while (subMatch) {
            if (!subMatch[1] || !subMatch[2]) {
                return;
            }
            index = match.index + subMatch.index;
            comments.push({
                kind: subMatch[1],
                value: subMatch[2],
                line: getLineFromPos(contents, index)
            });
            subMatch = rInnerBlock.exec(baseMatch);
        }
        match = rBlockComment.exec(contents);
    }
    // sort by line number
    comments = comments.sort(function (a, b) {
        return a.line - b.line;
    });

    return comments;
};
