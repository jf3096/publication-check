"use strict";
const check_1 = require('../../libs/check');
const Logger_1 = require('../../libs/models/Logger');
const chai_configuration_1 = require('../chai-configuration');
describe('check', () => {
    describe(`unit test schema`, () => {
        it('#1 empty manifest file', (done) => {
            const zipPath = `test/sample/jsCache-master.zip`;
            const manifestPath = `test/sample/schema/#1/manifest.json`;
            check_1.default(zipPath, manifestPath).then(done, (err) => {
                chai_configuration_1.default(err.message).to.be.equals(`Unexpected end of JSON input`);
                done();
            });
        });
        it('#2 should fail as checkList is not presented', (done) => {
            const zipPath = `test/sample/jsCache-master.zip`;
            const manifestPath = `test/sample/schema/#2/manifest.json`;
            check_1.default(zipPath, manifestPath).then(done, (err) => {
                chai_configuration_1.default(err.message).to.be.equals(`{\n    "checkList": "key is not present in the object"\n}`);
                done();
            });
        });
        it('#3 should pass as checkList and blackList are presented', (done) => {
            const zipPath = `test/sample/jsCache-master.zip`;
            const manifestPath = `test/sample/schema/#3/manifest.json`;
            check_1.default(zipPath, manifestPath).then(done);
        });
        it('#4 should fail as checkList contains non-string matching value', (done) => {
            const zipPath = `test/sample/jsCache-master.zip`;
            const manifestPath = `test/sample/schema/#4/manifest.json`;
            check_1.default(zipPath, manifestPath).then(done, (err) => {
                chai_configuration_1.default(err.message).to.be.equals(`{\n    "checkList": {\n        "test": {\n            "0": "123456 is not a String"\n        }\n    }\n}`);
                done();
            });
        });
    });
    describe('unit test check function', () => {
        it('#1 should pass check function', (done) => {
            const zipPath = `test/sample/jsCache-master.zip`;
            const manifestPath = `test/sample/1/manifest.json`;
            check_1.default(zipPath, manifestPath).then(done);
        });
        it('#2 should pass check function', (done) => {
            const zipPath = `test/sample/jsCache-master.zip`;
            const manifestPath = `test/sample/2/manifest.json`;
            check_1.default(zipPath, manifestPath).then(done);
        });
        it('#3 ensure all js file contains `window.document`', (done) => {
            const zipPath = `test/sample/jsCache-master.zip`;
            const manifestPath = `test/sample/3/manifest.json`;
            check_1.default(zipPath, manifestPath).then(done);
        });
        it('#4 should log error message as no js contains `window.queryString`', (done) => {
            const zipPath = `test/sample/jsCache-master.zip`;
            const manifestPath = `test/sample/4/manifest.json`;
            const interceptPush = Logger_1.default.prototype.push;
            let counter = 0;
            Logger_1.default.prototype.push = function ({ fileAbsPath, errorMessage, level = 0 /* error */ }) {
                if (counter === 0) {
                    chai_configuration_1.default(fileAbsPath).to.be.equal('jsCache-master/dist/jsCache.js');
                    chai_configuration_1.default(errorMessage).to.be.equal(`check list pattern not found. keyword = window.queryString`);
                    chai_configuration_1.default(level).to.be.equal(0 /* error */);
                }
                else if (counter === 1) {
                    chai_configuration_1.default(fileAbsPath).to.be.equal('jsCache-master/dist/jsCache.min.js');
                    chai_configuration_1.default(errorMessage).to.be.equal(`check list pattern not found. keyword = window.queryString`);
                    chai_configuration_1.default(level).to.be.equal(0 /* error */);
                }
                else if (counter === 2) {
                    chai_configuration_1.default(fileAbsPath).to.be.equal('jsCache-master/dist/localStorage.min.js');
                    chai_configuration_1.default(errorMessage).to.be.equal(`check list pattern not found. keyword = window.queryString`);
                    chai_configuration_1.default(level).to.be.equal(0 /* error */);
                }
                else if (counter === 3) {
                    chai_configuration_1.default(fileAbsPath).to.be.equal('jsCache-master/src/jsCache.js');
                    chai_configuration_1.default(errorMessage).to.be.equal(`check list pattern not found. keyword = window.queryString`);
                    chai_configuration_1.default(level).to.be.equal(0 /* error */);
                }
                counter++;
                interceptPush.apply(Logger_1.default.getInstance(), arguments);
            };
            check_1.default(zipPath, manifestPath).then(done);
        });
        it('#5 check all the js contains /DOMContentLoaded.*?loaded/`', (done) => {
            const zipPath = `test/sample/jsCache-master.zip`;
            const manifestPath = `test/sample/5/manifest.json`;
            const interceptPush = Logger_1.default.prototype.push;
            let counter = 0;
            Logger_1.default.prototype.push = function ({ fileAbsPath, errorMessage, level = 0 /* error */ }) {
                if (counter === 0) {
                    chai_configuration_1.default(fileAbsPath).to.be.equal('jsCache-master/dist/localStorage.min.js');
                    chai_configuration_1.default(errorMessage).to.be.equal(`check list pattern not found. keyword = /DOMContentLoaded.*?loaded/`);
                    chai_configuration_1.default(level).to.be.equal(0 /* error */);
                }
                counter++;
                interceptPush.apply(Logger_1.default.getInstance(), arguments);
            };
            check_1.default(zipPath, manifestPath).then(done);
        });
        it('#6 expect files contains blacklist keyword', (done) => {
            const interceptPush = Logger_1.default.prototype.push;
            let counter = 0;
            Logger_1.default.prototype.push = function ({ fileAbsPath, errorMessage, level = 0 /* error */ }) {
                if (counter === 0) {
                    chai_configuration_1.default(fileAbsPath).to.be.equal('jsCache-master/dist/jsCache.js');
                    chai_configuration_1.default(errorMessage).to.be.equal(`"readystatechange", "loaded", "load",   "complete`);
                    chai_configuration_1.default(level).to.be.equal(0 /* error */);
                }
                else if (counter === 1) {
                    chai_configuration_1.default(fileAbsPath).to.be.equal('jsCache-master/dist/jsCache.min.js');
                    chai_configuration_1.default(errorMessage).to.be.equal(`"readystatechange","loaded","load","complete","GET`);
                    chai_configuration_1.default(level).to.be.equal(0 /* error */);
                }
                else if (counter === 2) {
                    chai_configuration_1.default(fileAbsPath).to.be.equal('jsCache-master/src/jsCache.js');
                    chai_configuration_1.default(errorMessage).to.be.equal(`"readystatechange", "loaded", "load",   "complete`);
                    chai_configuration_1.default(level).to.be.equal(0 /* error */);
                }
                counter++;
                interceptPush.apply(Logger_1.default.getInstance(), arguments);
            };
            check_1.default(`test/sample/jsCache-master.zip`, `test/sample/6/manifest.json`).then(done);
        });
    });
});
