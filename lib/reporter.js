'use strict';

const leasot = require('leasot');
const path = require('path');
const PluginError = require('plugin-error');
const through = require('through2');

const pluginName = 'gulp-todo';

/**
 *
 * @param {string|function} [reporter] The reporter to use. See https://pgilad.github.io/leasot/enums/builtinreporters.html
 * @param {Object} [reportOptions={}] Passed directly to `leasot.report` - See https://pgilad.github.io/leasot/index.html#report
 * @param {string} [fileName] Pass along options to the reporter, and also if you pass a `fileName` - it will rename the filename in stream
 * @returns {*}
 */
module.exports = function(reporter, { reportOptions = {}, fileName } = {}) {
    if (!reporter) {
        throw new PluginError('Reporter is required');
    }
    return through.obj(function(file, enc, cb) {
        if (file.isNull()) {
            return cb(null, file);
        }

        if (file.isStream()) {
            return cb(new PluginError(pluginName, 'Streaming not supported'));
        }

        // replace contents with requested reporter contents
        if (file.todos && file.todos.length) {
            const newContents = leasot.report(file.todos, reporter, reportOptions);

            if (fileName) {
                file.path = path.join(file.base, fileName);
            }
            file.contents = Buffer.from(newContents);
        }

        cb(null, file);
    });
};
