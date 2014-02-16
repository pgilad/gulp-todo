'use strict';
var assert = require('assert');
var gutil = require('gulp-util');
var todo = require('./index');

it('should log error on syntax errors', function (cb) {
    var stream = todo();

    stream.on('error', function (err) {
        assert(true);
        cb();
    });

    stream.write(new gutil.File({
        contents: new Buffer('var let = "foo"')
    }));
});
