import Manifest, {ValidityItem, ListEnum} from './models/Manifest';
import {checkAgainstZip} from './utils/fs';
import Logger from './models/Logger';
import Package from './models/Package';
import {escapeNewLine, string2regex} from './utils/common';

const mm = require('micromatch');

/**
 * check and get the match wildcard pattern
 *
 * @param fileName {string} the name of the file used for validity
 * @param patterns {string[]} a pattern list used for validate file name
 * @param options {any} by default it will ignore case under validity process
 * @returns {string[]} return those pattern that match file name
 */
function getMatchPattern(fileName: string, patterns: string[], options = {nocase: true}) {
    /**
     * ensure the parameter patterns must be array only
     */
    if (!Array.isArray(patterns)) {
        throw `patterns is required for further filter process`;
    }
    /**
     * process validity checking
     */
    return patterns.reduce((previous: string[], current: string) => {
        /**
         * check if pattern valid for target file name
         * if true, push it as the final result
         */
        mm.isMatch(fileName, current, options) && previous.push(current);
        return previous;
    }, []);
}

/**
 * crop invalid content
 */
function cropInvalidContent(match: RegExpExecArray): string {
    const cropLength = Package.getInstance().configs.showErrorWords;
    if (!match) {
        throw `expect parameter match not to be empty`;
    }
    return match.input.slice(match.index, match.index + cropLength);
}

/**
 * check whether the zip file is valid after validating against target manifest
 */
export default async function check(zipPath: string, manifestPath: string) {
    /**
     * parse manifest path to an custom manifest object
     */
    const manifest = new Manifest(manifestPath);
    /**
     * read the manifest file using manifest path
     */
    await manifest.read();

    const {manifestTransformedList} = manifest;

    let {touchMarkers} = manifest;

    /**
     * get all file pattern and store as an array
     */
    const filePatterns = Object.keys(manifestTransformedList);

    /**
     * check against zip, core module running from here
     */
    return new Promise((resolve) => {
        checkAgainstZip(zipPath,
            /**
             * here is a first callback. this callback requires manual validation of a file to determine whether the file is in the check list
             */
            (fileName: string) => {
                /**
                 * obtain all the match patterns
                 */
                const matchPatterns = getMatchPattern(fileName, filePatterns);

                /**
                 * traverse and remove those patterns that overlaps in touch markers
                 * this indicates files are found
                 */
                matchPatterns.forEach((matchPattern: string) => {
                    touchMarkers = touchMarkers.reduce((prev, cur) => {
                        cur != matchPattern && prev.push(cur);
                        return prev;
                    }, []);
                });

                return matchPatterns;
            },
            /**
             * here is a second callback function. this callback has obtained the content as well as match patterns and absolute file path
             * match patterns is used for locate the validity item
             * file absolute path is used for error logging purposes
             * content is the file content used for further black list and check list validation
             */
            (matchPatterns: string[], fileAbsPath: string, content: string) => {
                /**
                 * traverse the match patterns
                 */
                matchPatterns.forEach((matchPattern: string) => {
                    /**
                     * open the file pattern so that can access check list and black list from inside
                     */
                    manifestTransformedList[matchPattern].forEach(({keyword, type}: ValidityItem) => {
                        /**
                         * convert keyword to regex
                         */
                        const regex = string2regex(keyword, Package.getInstance().configs.defaultFlags);
                        /**
                         * examine the content
                         */
                        let match = regex.exec(content);

                        /**
                         * whether the validity item type is check list or black list
                         */
                        switch (type) {
                            case ListEnum.checkList:
                                /**
                                 * if no match in check list, throw errors
                                 */
                                !match && Logger.getInstance().push({errorMessage: `check list pattern not found. keyword = ${keyword}`, fileAbsPath});
                                break;
                            case ListEnum.blackList:
                                /**
                                 * if any match found, find all matches to log it
                                 */
                                if (match && match.length) {
                                    do {
                                        /**
                                         * remove \r\n or \r as it looks terrible in command line
                                         */
                                        const invalidContent = escapeNewLine(cropInvalidContent(match));
                                        /**
                                         * push the invalid content in logger, and will print it out at the end of process
                                         */
                                        Logger.getInstance().push({errorMessage: invalidContent, fileAbsPath});
                                    } while ((match = regex.exec(content)) != null);
                                }
                                break;
                            default:
                                throw `unexpected validity item type. type = ${type}`;
                        }
                    });
                });
            },
            () => {
                /**
                 * ensure the manifest settings enable all config keywords could be found in zip file.
                 */
                if (touchMarkers && touchMarkers.length) {
                    throw `manifest <${touchMarkers.join(',')}> does not exist in target zip file`;
                }
                /**
                 * output all the loggers
                 */
                Logger.getInstance().reportAll();
                /**
                 * mark it as resolve
                 */
                resolve();
            }
        );
    })
}