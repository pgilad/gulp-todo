'use strict';
var path = require('path');
var gutil = require('gulp-util');
var through = require('through2');
var defaults = require('lodash.defaults');
var helpers = require('./lib/helpers');
var parsers = require('./lib/parsers');
var configDefaults = require('./lib/config');
var PluginError = gutil.PluginError;
var pluginName = 'gulp-todo';

module.exports = function (params) {
    var config = defaults(params || {}, configDefaults);
    //verify types
    if (typeof config.transformHeader !== 'function') {
        throw new PluginError(pluginName, 'transformHeader must be a function');
    }
    if (typeof config.transformComment !== 'function') {
        throw new PluginError(pluginName, 'transformComment must be a function');
    }

    var firstFile;
    var comments = [];

    /* main object iteration */
    return through.obj(function (file, enc, cb) {
            //let null files pass through
            if (file.isNull()) {
                this.push(file);
                return cb();
            }
            //don't handle streams for now
            if (file.isStream()) {
                this.emit('error', new PluginError(pluginName, 'Streaming not supported'));
                return cb();
            }

            //assign first file to get relative cwd/path
            if (!firstFile) {
                firstFile = file;
            }

            //get extension - assume .js as default
            var ext = path.extname(file.path) || '.js';
            //check if parser for filetype exists
            if (!parsers[ext]) {
                var msg = 'File: ' + file.path + ' - Extension ' + gutil.colors.red(ext) + ' is not supported';
                this.emit('error', new PluginError(pluginName, msg));
                return cb();
            }

            var contents = file.contents.toString('utf8');
            //TODO: figure out if this is the best way to call a parser
            var fileCommentsArr = parsers[ext]().call(this, contents);
            if (!fileCommentsArr || !fileCommentsArr.length) {
                return cb();
            }
            var mappedComments = helpers.getMappedComments(fileCommentsArr, file);
            if (config.verbose) {
                helpers.logCommentsToConsole(mappedComments);
            }
            comments = comments.concat(mappedComments);
            return cb();
        },
        function (cb) {
            if (!firstFile || !comments.length) {
                return cb();
            }
            var todoFile = new gutil.File({
                cwd: firstFile.cwd,
                base: firstFile.cwd,
                path: path.join(firstFile.cwd, config.fileName),
                contents: new Buffer(helpers.generateContents(comments, config))
            });

            this.push(todoFile);
            return cb();
        });
};
