'use strict';

const colors = require('ansi-colors');
const defaults = require('lodash.defaults');
const fancyLog = require('fancy-log');
const leasot = require('leasot');
const omit = require('lodash.omit');
const path = require('path');
const PluginError = require('plugin-error');
const through = require('through2');
const Vinyl = require('vinyl');

const pluginName = 'gulp-todo';

function logCommentsToConsole(comments) {
    comments.forEach(function (comment) {
        const isTodo = /todo/i.test(comment.tag);
        const commentType = isTodo ? colors.cyan(comment.tag) : colors.magenta(comment.tag);
        const commentLocation = '@' + colors.gray(comment.file + ':' + comment.line);
        fancyLog(commentType, comment.text, commentLocation);
    });
}

module.exports = function (options = {}) {
    options = defaults({}, options, {
        absolute: false,
        fileName: 'TODO.md',
        reporter: 'markdown',
        skipUnsupported: false,
        verbose: false,
    });
    const config = omit(options, ['fileName', 'verbose', 'absolute']);
    let firstFile;
    const comments = [];

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
            const ext = path.extname(file.path) || '.js';

            //check if parser for filetype exists
            if (!leasot.isExtensionSupported(ext)) {
                if (!options.skipUnsupported) {
                    const msg = `File: ${file.path} with extension ${colors.red(ext)} is not supported`;
                    return cb(new PluginError(pluginName, msg));
                }
                if (options.verbose) {
                    const msg = `Skipping file ${file.path} with extension ${colors.red(ext)} as it is unsupported`;
                    fancyLog(msg);
                }
                return cb();
            }
            const filePath = options.absolute ? file.path : file.path && file.relative || file.path;

            const parsedComments = leasot.parse(file.contents.toString(), {
                associateParser: config.associateParser,
                customParsers: config.customParsers,
                customTags: config.customTags,
                extension: ext,
                filename: filePath,
                withInlineFiles: config.withIncludedFiles
            });
            if (options.verbose) {
                logCommentsToConsole(parsedComments);
            }
            comments.push(...parsedComments);
            cb();
        },
        function reportTodos(cb) {
            if (!firstFile) {
                return cb();
            }
            const reporterContents = leasot.report(comments, options.reporter, options);

            const todoFile = new Vinyl({
                cwd: firstFile.cwd,
                base: firstFile.base,
                path: path.join(firstFile.base, options.fileName),
                contents: Buffer.from(reporterContents)
            });

            // also pass along comments object for future reporters
            todoFile.todos = comments;
            this.push(todoFile);
            cb();
        });
};

const reporter = require('./lib/reporter');
module.exports.reporter = reporter;
