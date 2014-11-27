'use strict';
var compact = require('lodash.compact');

var getParser = {
    '.js': function () {
        return require('./parsers/defaultParser');
    },
    '.jade': function () {
        return require('./parsers/jadeParser');
    },
    '.styl': function () {
        return require('./parsers/defaultParser');
    },
    '.hbs': function () {
        return require('./parsers/hbsParser');
    },
    '.sass': function () {
        return require('./parsers/defaultParser');
    },
    '.scss': function () {
        return require('./parsers/defaultParser');
    },
    '.ts': function () {
        return require('./parsers/defaultParser');
    },
    '.coffee': function () {
        return require('./parsers/coffeeParser');
    }
};

function isExtSupported(ext) {
    return Boolean(getParser[ext]);
}

function getMappedComment(comment, file) {
    return {
        file: file || 'unknown file',
        text: comment.text.trim(),
        kind: comment.kind.toUpperCase(),
        line: comment.line
    };
}

function mapComments(comments, file) {
    return comments.map(function (comment) {
        return getMappedComment(comment, file);
    });
}

function parse(ext, contents, file) {
    if (!isExtSupported(ext)) {
        throw Error('extension ' + ext + ' is not supported.');
    }
    var comments = getParser[ext]()(contents);
    return mapComments(comments, file);
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
 * reporter
 * generates the markdown output
 *
 * @param {Array} comments
 * @param {Object} config
 * @return
 */
function reporter(comments, config) {
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

exports.isExtSupported = isExtSupported;
exports.parse = parse;
exports.reporter = reporter;
