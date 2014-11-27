'use strict';
var path = require('path');
var gutil = require('gulp-util');
var through = require('through2');
var helpers = require('./lib/helpers');
var PluginError = gutil.PluginError;
var pluginName = 'gulp-todo';

/**
 * @param {object} params
 * @param {string} [params.fileName='TODO.md']
 * @param {number} [params.padding=2]
 * @param {string} [params.newLine='\n']
 * @param {boolean} [params.verbose=false]
 * @param {function} [params.transformComment]
 * @param {function} [params.transformHeader]
 * @return {stream} Returns the transformed stream
 */
module.exports = function (params) {
    var firstFile;
    var comments = [];
    var config = helpers.getConfig(params);

    return through.obj(function (file, enc, cb) {
            //let null files pass through
            if (file.isNull()) {
                cb(null, file);
                return;
            }

            //don't handle streams for now
            if (file.isStream()) {
                cb(new PluginError(pluginName, 'Streaming not supported'));
                return;
            }

            //assign first file to get relative cwd/path
            if (!firstFile) {
                firstFile = file;
            }

            //get extension - assume .js as default
            var ext = path.extname(file.path) || '.js';
            //check if parser for filetype exists
            if (!helpers.isExtSupported(ext)) {
                var msg = 'File: ' + file.path + ' - Extension ' + gutil.colors.red(ext) + ' is not supported';
                cb(new PluginError(pluginName, msg));
                return;
            }

            var contents = file.contents.toString('utf8');
            var filePath = file.path && file.relative || file.path;
            var _comments = helpers.parse(ext, contents, filePath);
            if (!_comments || !_comments.length) {
                cb();
                return;
            }
            if (config.verbose) {
                helpers.logCommentsToConsole(_comments);
            }
            comments = comments.concat(_comments);
            cb();
        },
        function (cb) {
            if (!firstFile) {
                cb();
                return;
            }
            var newContents = helpers.reporter(comments, config);
            var todoFile = new gutil.File({
                cwd: firstFile.cwd,
                base: firstFile.base,
                path: path.join(firstFile.base, config.fileName),
                contents: new Buffer(newContents)
            });

            this.push(todoFile);
            cb();
        });
};
