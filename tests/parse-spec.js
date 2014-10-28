'use strict';
var fs = require('fs');
var should = require('should');
var path = require('path');
var parsers = require('../lib/parsers');

var getFixturePath = function (file) {
    return path.join('./tests/fixtures/', file);
};

var getComments = function (file) {
    var content = fs.readFileSync(file, 'utf8');
    return parsers[path.extname(file)]()(content);
};

describe('gulp-todo parsing', function () {
    describe('stylus', function () {
        it('parse simple line comments', function () {
            var file = getFixturePath('line.styl');
            var comments = getComments(file);
            should.exist(comments);
            comments.should.have.length(1);
            comments[0].kind.should.equal('FIXME');
        });

        it('parse block line comments', function () {
            var file = getFixturePath('block.styl');
            var comments = getComments(file);
            should.exist(comments);
            comments.should.have.length(2);
            comments[0].kind.should.equal('TODO');
            comments[1].kind.should.equal('FIXME');
        });
    });

    describe('handlebars', function () {
        it('parse {{! }} and {{!-- --}} comments', function () {
            var file = getFixturePath('handlebars.hbs');
            var comments = getComments(file);
            should.exist(comments);
            comments.should.have.length(4);
            comments[0].kind.should.equal('TODO');
            comments[1].kind.should.equal('FIXME');
            comments[2].kind.should.equal('TODO');
            comments[3].kind.should.equal('TODO');
        });
    });

    describe('sass', function () {
        it('parse // and /* comments', function () {
            var file = getFixturePath('block.sass');
            var comments = getComments(file);
            should.exist(comments);
            comments.should.have.length(4);
            comments[0].kind.should.equal('TODO');
            comments[0].line.should.equal(2);
            comments[1].kind.should.equal('FIXME');
            comments[1].line.should.equal(3);
            comments[2].kind.should.equal('FIXME');
            comments[2].line.should.equal(10);
            comments[3].kind.should.equal('TODO');
            comments[3].line.should.equal(14);
        });
    });

    describe('scss', function () {
        it('parse // and /* comments', function () {
            var file = getFixturePath('block.scss');
            var comments = getComments(file);
            should.exist(comments);
            comments.should.have.length(1);
            comments[0].kind.should.equal('TODO');
            comments[0].line.should.equal(4);
        });
    });

    describe('typescript', function () {
        it('parse // and /* comments', function () {
            var file = getFixturePath('typescript.ts');
            var comments = getComments(file);
            should.exist(comments);
            comments.should.have.length(2);
            comments[0].kind.should.equal('TODO');
            comments[0].line.should.equal(1);
            comments[1].kind.should.equal('FIXME');
            comments[1].line.should.equal(11);
        });
    });
});
