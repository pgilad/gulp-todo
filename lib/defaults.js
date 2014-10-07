'use strict';
var gutil = require('gulp-util');

module.exports = {
    fileName: 'TODO.md',
    verbose: false,
    newLine: gutil.linefeed,
    transformComment: function (file, line, text) {
        return ['| ' + file + ' | ' + line + ' | ' + text];
    },
    transformHeader: function (kind) {
        return ['### ' + kind + 's',
            '| Filename | line # | todo',
            '|:------|:------:|:------'
        ];
    }
};
