'use strict';

const colors = require('ansi-colors');
const fancyLog = require('fancy-log');
const leasot = require('leasot');
const path = require('path');
const PluginError = require('plugin-error');
const through = require('through2');
const Vinyl = require('vinyl');

const pluginName = 'gulp-todo';

function logCommentsToConsole(comments) {
    comments.forEach(function(comment) {
        const isTodo = /todo/i.test(comment.tag);
        const commentType = isTodo ? colors.cyan(comment.tag) : colors.magenta(comment.tag);
        const commentLocation = '@' + colors.gray(comment.file + ':' + comment.line);
        fancyLog(commentType, comment.text, commentLocation);
    });
}

/**
 *
 * @param {boolean} [absolute=false] Output absolute paths of files (as available via `file.path`)
 * @param {string} [fileName=TODO.md] Specify the output filename
 * @param {Object} [parseOptions={}] Passed directly to `leasot.parse` - See [ParseConfig](https://pgilad.github.io/leasot/interfaces/parseconfig.html)
 * @param {string|function} [reporter=markdown] The reporter to use. See https://pgilad.github.io/leasot/enums/builtinreporters.html
 * @param {Object} [reportOptions={}] Passed directly to `leasot.report` - See https://pgilad.github.io/leasot/index.html#report
 * @param {boolean} [skipUnsupported=false] Whether to skip unsupported files or not
 * @param {boolean} [verbose=false] Output comments to console as well
 * @returns {*}
 */
module.exports = function({
    absolute = false,
    fileName = 'TODO.md',
    parseOptions = {},
    reporter = 'markdown',
    reportOptions = {},
    skipUnsupported = false,
    verbose = false,
} = {}) {
    let firstFile;
    const comments = [];

    return through.obj(
        function collectTodos(file, enc, cb) {
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
                if (!skipUnsupported) {
                    const msg = `File: ${file.path} with extension ${colors.red(ext)} is not supported`;
                    return cb(new PluginError(pluginName, msg));
                }
                if (verbose) {
                    const msg = `Skipping file ${file.path} with extension ${colors.red(ext)} as it is unsupported`;
                    fancyLog(msg);
                }
                return cb();
            }
            const filePath = absolute ? file.path : (file.path && file.relative) || file.path;

            const parsedComments = leasot.parse(file.contents.toString(), {
                associateParser: parseOptions.associateParser,
                customParsers: parseOptions.customParsers,
                customTags: parseOptions.customTags,
                extension: ext,
                filename: filePath,
                withInlineFiles: parseOptions.withInlineFiles,
            });
            if (verbose) {
                logCommentsToConsole(parsedComments);
            }
            comments.push(...parsedComments);
            cb();
        },
        function reportTodos(cb) {
            if (!firstFile) {
                return cb();
            }
            const reporterContents = leasot.report(comments, reporter, reportOptions);

            const todoFile = new Vinyl({
                base: firstFile.base,
                contents: Buffer.from(reporterContents),
                cwd: firstFile.cwd,
                path: path.join(firstFile.base, fileName),
            });

            // also pass along comments object for future reporters
            todoFile.todos = comments;
            cb(null, todoFile);
        }
    );
};

const reporter = require('./lib/reporter');
module.exports.reporter = reporter;
