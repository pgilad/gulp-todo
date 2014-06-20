'use strict';
var path = require('path');
var gutil = require('gulp-util');
var through = require('through2');
var defaults = require('lodash.defaults');
var helpers = require('./lib/helpers');

var PluginError = gutil.PluginError;

/* list of supported extensions their parsers */
var parsers = {
    //TODO: extract this to another lib?
    '.js': require('./lib/jsParser')
};

module.exports = function(params) {
    params = params || {};
    //assign default params
    var config = defaults(params, {
        fileName: 'todo.md',
        verbose: false,
        newLine: gutil.linefeed,
        transformComment: function(file, line, text) {
            return ['| ' + file + ' | ' + line + ' | ' + text];
        },
        transformHeader: function(kind) {
            return ['### ' + kind + 's',
                '| Filename | line # | todo',
                '|:--------:|:------:|:------:'];
        }
    });

    //verify types
    if (typeof config.transformHeader !== 'function') {
        throw new PluginError('gulp-todo', 'transformHeader must be a function');
    }
    if (typeof config.transformComment !== 'function') {
        throw new PluginError('gulp-todo', 'transformComment must be a function');
    }

    var firstFile;
    var comments = [];

    /* main object iteration */
    return through.obj(function(file, enc, cb) {
            //let null files pass through
            if (file.isNull()) {
                this.push(file);
                return cb();
            }
            //can't handle streams for now
            if (file.isStream()) {
                this.emit('error', new PluginError('gulp-todo', 'Streaming not supported'));
                return cb();
            }

            //assign first file to get relative cwd/path
            if (!firstFile) {
                firstFile = file;
            }

            //get extension of file - assume javascript if null
            var ext = path.extname(file.path) || '.js';
            //check if parser for filetype exists
            if (!parsers[ext]) {
                var msg = 'File extension ' + gutil.colors.red(ext) + ' is not supported';
                this.emit('error', new PluginError('gulp-todo', msg));
                return cb();
            }

            var contents = file.contents.toString('utf8');
            //TODO: figure out if this is the best way to call a parser
            var fileCommentsArr = parsers[ext].call(this, contents);

            //if we got any comments from file
            if (fileCommentsArr && fileCommentsArr.length) {
                //map comments to our working comment object
                var fileComments = fileCommentsArr.map(function(comment) {
                    return helpers.mapCommentObject(comment, file);
                });
                //append to existing comments
                comments = comments.concat(fileComments);
                if (config.verbose) {
                    helpers.logCommentsToConsole(fileComments);
                }
            }

            return cb();
        },
        function(cb) {
            //didn't get any files or have no comments
            if (!firstFile || !comments.length) {
                return cb();
            }
            //build stream file
            var todoFile = new gutil.File({
                cwd: firstFile.cwd,
                base: firstFile.cwd,
                path: path.join(firstFile.cwd, config.fileName),
                contents: new Buffer(helpers.generateContents(comments, config))
            });

            //push the todo file
            this.push(todoFile);
            return cb();
        });
};
