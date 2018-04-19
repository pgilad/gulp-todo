'use strict';

var colors = require('ansi-colors');
var defaults = require('lodash.defaults');
var fancyLog = require('fancy-log');
var leasot = require('leasot');
var omit = require('lodash.omit');
var path = require('path');
var PluginError = require('plugin-error');
var through = require('through2');
var Vinyl = require('vinyl');

var pluginName = 'gulp-todo';

function logCommentsToConsole(comments) {
    comments.forEach(function (comment) {
        var isTodo = /todo/i.test(comment.kind);
        var commentType = isTodo ? colors.cyan(comment.kind) : colors.magenta(comment.kind);
        var commentLocation = '@' + colors.gray(comment.file + ':' + comment.line);
        fancyLog(commentType, comment.text, commentLocation);
    });
}

module.exports = function (options) {
    options = defaults(options || {}, {
        absolute: false,
        fileName: 'TODO.md',
        reporter: 'markdown',
        skipUnsupported: false,
        verbose: false,
    });
    var config = omit(options, ['fileName', 'verbose', 'absolute']);
    var firstFile;
    var comments = [];

    return through.obj(function collectTodos(file, enc, cb) {
            if (file.isNull()) {
                cb(null, file);
                return;
            }

            if (file.isStream()) {
                cb(new PluginError(pluginName, 'Streaming not supported'));
                return;
            }
            firstFile = firstFile || file;
            //get extension - assume .js as default
            var ext = path.extname(file.path) || '.js';
            //check if parser for filetype exists
            if (!leasot.isExtSupported(ext)) {
                if (!options.skipUnsupported) {
                    var msg = ['File:', file.path, '- Extension', colors.red(ext),
                        'is not supported'
                    ].join(' ');
                    cb(new PluginError(pluginName, msg));
                    return;
                } else if (options.verbose) {
                    var msg = ['Skipping file', file.path, 'with extension',
                                    colors.red(ext), 'as it is unsupported'].join(' ');
                    fancyLog(msg);
                }
                cb();
                return;
            }
            var filePath;
            if (options.absolute) {
                filePath = file.path;
            } else {
                filePath = file.path && file.relative || file.path;
            }
            var _comments = leasot.parse({
                content: file.contents.toString('utf8'),
                customTags: config.customTags,
                ext: ext,
                fileName: filePath,
                withInlineFiles: config.withInlineFiles
            });
            if (options.verbose) {
                logCommentsToConsole(_comments);
            }
            comments = comments.concat(_comments);
            cb();
        },
        function reportTodos(cb) {
            if (!firstFile) {
                cb();
                return;
            }
            var newContents;
            try {
                newContents = leasot.reporter(comments, config);
            } catch (e) {
                cb(new PluginError(pluginName, e));
                return;
            }

            var todoFile = new Vinyl({
                cwd: firstFile.cwd,
                base: firstFile.base,
                path: path.join(firstFile.base, options.fileName),
                contents: new Buffer(newContents)
            });
            // also pass along comments object for future reporters
            todoFile.todos = comments;
            this.push(todoFile);
            cb();
        });
};

var reporter = require('./lib/reporter');
module.exports.reporter = reporter;
