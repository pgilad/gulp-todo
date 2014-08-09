'use strict';
var fs = require('fs');
var should = require('should');
var parsers = require('../lib/parsers');

describe('gulp-todo parsing', function () {
    describe('stylus', function () {
        it('parse simple line comments', function () {
            var file = './tests/fixtures/line.styl';
            var content = fs.readFileSync(file, 'utf8');
            var comments = parsers['.styl']()(content);
            should.exist(comments);
            comments.should.have.length(1);
            comments[0].kind.should.equal('FIXME');
        });

        it('parse block line comments', function () {
            var file = './tests/fixtures/block.styl';
            var content = fs.readFileSync(file, 'utf8');
            var comments = parsers['.styl']()(content);
            should.exist(comments);
            comments.should.have.length(2);
            comments[0].kind.should.equal('TODO');
            comments[1].kind.should.equal('FIXME');
        });
    });
});