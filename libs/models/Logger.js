"use strict";
const gutil = require('gulp-util');
const chalk = require('chalk');
function getLogLevelDisplayName(logLevel) {
    return {
        [0 /* error */]: `error`,
        [1 /* fatal */]: `fatal`,
    }[logLevel];
}
exports.getLogLevelDisplayName = getLogLevelDisplayName;
class Logger {
    constructor() {
        this.logs = [];
        this.push = this.push.bind(this);
    }
    static getInstance() {
        if (!this.logger) {
            this.logger = new Logger();
        }
        return this.logger;
    }
    push({ fileAbsPath, errorMessage, level = 0 /* error */ }) {
        this.logs.push({ createTime: new Date(), level, errorMessage, fileAbsPath });
    }
    report() {
        const { createTime, level, errorMessage, fileAbsPath } = this.logs.shift();
        gutil.log(`${chalk.red('✘ ')} ${chalk.gray(createTime.toLocaleString())} level = ${getLogLevelDisplayName(level)} path = ${chalk.green(fileAbsPath)} errorMessage = ${chalk.red(errorMessage)}`);
    }
    reportAll() {
        while (this.logs.length) {
            this.report();
        }
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Logger;
