'use strict';
/* list of supported extensions their parsers */
module.exports = {
    '.js': function () {
        return require('./parsers/defaultParser');
    },
    '.jade': function () {
        return require('./parsers/jadeParser');
    },
    '.styl': function () {
        return require('./parsers/defaultParser');
    },
    '.hbs': function () {
        return require('./parsers/hbsParser');
    },
    '.sass': function () {
        return require('./parsers/defaultParser');
    },
    '.scss': function () {
        return require('./parsers/defaultParser');
    },
    '.ts': function () {
        return require('./parsers/defaultParser');
    },
    '.coffee': function () {
        return require('./parsers/coffeeParser');
    }
};
