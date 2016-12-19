import Package from './libs/models/Package';
import * as program from 'commander';
import ICommand = commander.ICommand;
import IExportedCommand = commander.IExportedCommand;
const packageContent = Package.getInstance();
import * as path from 'path';
import check from './libs/check';
const cliPath = process.cwd();

interface ICliParams {
    zip: string;
    manifest: string;
}

function configureCommander(): void {
    program
        .version(packageContent.version)
        .option('-z, --zip <value>', 'target zip file path')
        .option('-m, --manifest <value>', 'target manifest file')
        .parse(process.argv);
}

function convertPath2Absolute(rawPath: string): string {
    if (path.isAbsolute(rawPath)) {
        return rawPath;
    }
    return path.resolve(cliPath, rawPath);
}

function getCliParams(): ICliParams {
    const {zip, manifest} = (program as ICliParams&IExportedCommand);
    if (!zip || !manifest) {
        program.outputHelp();
        throw `please zip path and manifest path`;
    }
    return {
        zip: convertPath2Absolute(zip),
        manifest: convertPath2Absolute(manifest)
    }
}

export default function exec(cliParams?: ICliParams) {
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
    check(cliParams.zip, cliParams.manifest);
}