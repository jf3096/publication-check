import * as gutil from 'gulp-util';
import * as chalk from 'chalk';

export const enum LogLevel{
    error,
    fatal
}

export function getLogLevelDisplayName(logLevel: LogLevel) {
    return {
        [LogLevel.error]: `error`,
        [LogLevel.fatal]: `fatal`,
    }[logLevel];
}

interface Log {
    createTime: Date;
    fileAbsPath: string;
    errorMessage: string;
    level: LogLevel
}

export default class Logger {

    private static logger;

    public static getInstance(): Logger {
        if (!this.logger) {
            this.logger = new Logger();
        }
        return this.logger;
    }

    private logs: Log[];

    private constructor() {
        this.logs = [];
        this.push = this.push.bind(this);
    }

    public push({fileAbsPath, errorMessage, level = LogLevel.error}) {
        this.logs.push({createTime: new Date(), level, errorMessage, fileAbsPath})
    }

    private report() {
        const {createTime, level, errorMessage, fileAbsPath} = this.logs.shift();
        gutil.log(
            `${chalk.red('✘ ')} ${chalk.gray(createTime.toLocaleString())} level = ${getLogLevelDisplayName(level)} path = ${chalk.green(fileAbsPath)} errorMessage = ${chalk.red(errorMessage)}`
        );
    }

    public reportAll() {
        while (this.logs.length) {
            this.report();
        }
    }
}