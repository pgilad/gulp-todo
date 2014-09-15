'use strict';
/* list of supported extensions their parsers */
module.exports = {
    //TODO: extract this to another lib?
    '.js': function () {
        return require('./parsers/jsParser');
    },
    '.jade': function () {
        return require('./parsers/jadeParser');
    },
    '.styl': function () {
        return require('./parsers/stylusParser');
    },
    '.hbs': function () {
        return require('./parsers/hbsParser');
    },
    '.sass': function () {
        return require('./parsers/sassParser');
    },
    '.scss': function () {
        return require('./parsers/sassParser');
    }
};
