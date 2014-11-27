'use strict';
var gutil = require('gulp-util');
var defaults = require('lodash.defaults');
var os = require('os');

function logCommentsToConsole(comments) {
    comments.forEach(function (comment) {
        var isTodo = /todo/i.test(comment.kind);
        var commentType = isTodo ? gutil.colors.cyan(comment.kind) : gutil.colors.magenta(comment.kind);
        var commentLocation = '@' + gutil.colors.gray(comment.file + ':' + comment.line);
        gutil.log(commentType, comment.text, commentLocation);
    });
}

function getConfig(params) {
    //jshint unused:false
    var defaultParams = {
        fileName: 'TODO.md',
        padding: 2,
        verbose: false,
        newLine: os.EOL,
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
        throw new Error('transformHeader must be a function');
    }
    if (typeof config.transformComment !== 'function') {
        throw new Error('transformComment must be a function');
    }
    // padding must be a minimum of 0
    // enforce padding to be a number as well
    config.padding = Math.max(0, parseInt(config.padding, 10));
    return config;
}

exports.logCommentsToConsole = logCommentsToConsole;
exports.getConfig = getConfig;
