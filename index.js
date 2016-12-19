"use strict";
const Package_1 = require('./libs/models/Package');
const program = require('commander');
const packageContent = Package_1.default.getInstance();
const path = require('path');
const check_1 = require('./libs/check');
const cliPath = process.cwd();
function configureCommander() {
    program
        .version(packageContent.version)
        .option('-z, --zip <value>', 'target zip file path')
        .option('-m, --manifest <value>', 'target manifest file')
        .parse(process.argv);
}
function convertPath2Absolute(rawPath) {
    if (path.isAbsolute(rawPath)) {
        return rawPath;
    }
    return path.resolve(cliPath, rawPath);
}
function getCliParams() {
    const { zip, manifest } = program;
    if (!zip || !manifest) {
        program.outputHelp();
        throw `please zip path and manifest path`;
    }
    return {
        zip: convertPath2Absolute(zip),
        manifest: convertPath2Absolute(manifest)
    };
}
function exec(cliParams) {
    configureCommander();
    if (arguments.length === 0) {
        cliParams = cliParams || getCliParams();
    }
    if (!cliParams.zip) {
        program.outputHelp();
        throw `please provide zip path`;
    }
    if (!cliParams.manifest) {
        program.outputHelp();
        throw `please provide manifest path`;
    }
    check_1.default(cliParams.zip, cliParams.manifest);
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exec;
