'use strict';

const leasot = require('leasot');
const path = require('path');
const PluginError = require('plugin-error');
const through = require('through2');

const pluginName = 'gulp-todo';

module.exports = function (reporter, options = {}) {
    if (!reporter) {
        throw new PluginError('Reporter is required');
    }
    const fileName = options.fileName;
    delete options.fileName;

    return through.obj(function (file, enc, cb) {
        if (file.isNull()) {
            return cb(null, file);
        }

        if (file.isStream()) {
            return cb(new PluginError(pluginName, 'Streaming not supported'));
        }

        // replace contents with requested reporter contents
        if (file.todos && file.todos.length) {
            const newContents = leasot.report(file.todos, reporter, options);

            if (fileName) {
                file.path = path.join(file.base, fileName);
            }
            file.contents = Buffer.from(newContents);
        }

        cb(null, file);
    });
};
