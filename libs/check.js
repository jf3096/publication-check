"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const Manifest_1 = require('./models/Manifest');
const fs_1 = require('./utils/fs');
const Logger_1 = require('./models/Logger');
const Package_1 = require('./models/Package');
const common_1 = require('./utils/common');
const mm = require('micromatch');
/**
 * check and get the match wildcard pattern
 *
 * @param fileName {string} the name of the file used for validity
 * @param patterns {string[]} a pattern list used for validate file name
 * @param options {any} by default it will ignore case under validity process
 * @returns {string[]} return those pattern that match file name
 */
function getMatchPattern(fileName, patterns, options = { nocase: true }) {
    /**
     * ensure the parameter patterns must be array only
     */
    if (!Array.isArray(patterns)) {
        throw `patterns is required for further filter process`;
    }
    /**
     * process validity checking
     */
    return patterns.reduce((previous, current) => {
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
function cropInvalidContent(match) {
    const cropLength = Package_1.default.getInstance().configs.showErrorWords;
    if (!match) {
        throw `expect parameter match not to be empty`;
    }
    return match.input.slice(match.index, match.index + cropLength);
}
/**
 * check whether the zip file is valid after validating against target manifest
 */
function check(zipPath, manifestPath) {
    return __awaiter(this, void 0, void 0, function* () {
        /**
         * parse manifest path to an custom manifest object
         */
        const manifest = new Manifest_1.default(manifestPath);
        /**
         * read the manifest file using manifest path
         */
        yield manifest.read();
        const { manifestTransformedList } = manifest;
        let { touchMarkers } = manifest;
        /**
         * get all file pattern and store as an array
         */
        const filePatterns = Object.keys(manifestTransformedList);
        /**
         * check against zip, core module running from here
         */
        return new Promise((resolve) => {
            fs_1.checkAgainstZip(zipPath, 
            /**
             * here is a first callback. this callback requires manual validation of a file to determine whether the file is in the check list
             */
                (fileName) => {
                /**
                 * obtain all the match patterns
                 */
                const matchPatterns = getMatchPattern(fileName, filePatterns);
                /**
                 * traverse and remove those patterns that overlaps in touch markers
                 * this indicates files are found
                 */
                matchPatterns.forEach((matchPattern) => {
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
                (matchPatterns, fileAbsPath, content) => {
                /**
                 * traverse the match patterns
                 */
                matchPatterns.forEach((matchPattern) => {
                    /**
                     * open the file pattern so that can access check list and black list from inside
                     */
                    manifestTransformedList[matchPattern].forEach(({ keyword, type }) => {
                        /**
                         * convert keyword to regex
                         */
                        const regex = common_1.string2regex(keyword, Package_1.default.getInstance().configs.defaultFlags);
                        /**
                         * examine the content
                         */
                        let match = regex.exec(content);
                        /**
                         * whether the validity item type is check list or black list
                         */
                        switch (type) {
                            case 0 /* checkList */:
                                /**
                                 * if no match in check list, throw errors
                                 */
                                !match && Logger_1.default.getInstance().push({ errorMessage: `check list pattern not found. keyword = ${keyword}`, fileAbsPath });
                                break;
                            case 1 /* blackList */:
                                /**
                                 * if any match found, find all matches to log it
                                 */
                                if (match && match.length) {
                                    do {
                                        /**
                                         * remove \r\n or \r as it looks terrible in command line
                                         */
                                        const invalidContent = common_1.escapeNewLine(cropInvalidContent(match));
                                        /**
                                         * push the invalid content in logger, and will print it out at the end of process
                                         */
                                        Logger_1.default.getInstance().push({ errorMessage: invalidContent, fileAbsPath });
                                    } while ((match = regex.exec(content)) != null);
                                }
                                break;
                            default:
                                throw `unexpected validity item type. type = ${type}`;
                        }
                    });
                });
            }, () => {
                /**
                 * ensure the manifest settings enable all config keywords could be found in zip file.
                 */
                if (touchMarkers && touchMarkers.length) {
                    throw `manifest <${touchMarkers.join(',')}> does not exist in target zip file`;
                }
                /**
                 * output all the loggers
                 */
                Logger_1.default.getInstance().reportAll();
                /**
                 * mark it as resolve
                 */
                resolve();
            });
        });
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = check;
