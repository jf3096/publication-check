"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const fs = require('fs');
const yauzl = require('yauzl');
/**
 *  wrap fs readFile with a promise so that enables to use async/await
 */
function readFileAsyncPromise(filename) {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, (err, data) => {
            err ? reject(err) : resolve(data.toString());
        });
    });
}
exports.readFileAsyncPromise = readFileAsyncPromise;
/**
 * read the file and convert to json
 */
function readFileAsyncPromiseAsJson(filename) {
    return __awaiter(this, void 0, void 0, function* () {
        return JSON.parse(yield readFileAsyncPromise(filename));
    });
}
exports.readFileAsyncPromiseAsJson = readFileAsyncPromiseAsJson;
/**
 * read through all the chunk and pass it to data as well as convert to string
 *
 * the following might cause memory crash for server application
 * however, since each entry will dump after read, memory should not be a main issue in this case.
 * report in my github if exception throws due to extremely large file
 */
function readSteam2Data(readStream) {
    return new Promise((resolve, reject) => {
        let data = ``;
        readStream
            .on('data', function (chunk) {
            data += chunk;
        })
            .once('error', (err) => {
            reject(err);
        })
            .on('finish', function () {
            resolve(data);
        });
    });
}
/**
 * read a specific zip file and expose two callback for custom process
 * @param zipFilePath {string} target zip file path, could be relative or absolute path
 * @param validateFileName {Function} validate filename obtained from zip file, check if it's match the pattern of manifest. if true, open it for more content
 * @param checkAgainstManifest {Function} check whether the content is valid against manifest file
 * @param onComplete {Function} a callback function indicate the entire process is done
 */
function checkAgainstZip(zipFilePath, validateFileName, checkAgainstManifest, onComplete) {
    /**
     * open the zip file
     * lazyEntries: This allows processing of one entry at a time, and will keep memory usage under control for zip files with many entries.
     */
    yauzl.open(zipFilePath, { lazyEntries: true }, (err, zipFile) => {
        /**
         * throw out error if encounter any
         */
        if (err) {
            throw err;
        }
        /**
         * read the first entry
         */
        zipFile.readEntry();
        /**
         * this will open and read an available entry
         */
        zipFile.on(`entry`, (entry) => __awaiter(this, void 0, void 0, function* () {
            /**
             * get entry file name
             */
            const { fileName } = entry;
            /**
             * invoke first callback function which used to validate file name
             * this will determine whether open file stream in next step
             */
            const matched = validateFileName(fileName);
            /**
             * has any matched
             */
            if (matched && matched.length) {
                debugger;
                /**
                 * read the file
                 */
                zipFile.openReadStream(entry, (err, readStream) => __awaiter(this, void 0, void 0, function* () {
                    /**
                     * throw error if exists
                     */
                    if (err) {
                        throw err;
                    }
                    /**
                     * once read stream is done, trigger another read entry
                     */
                    readStream.on("end", function () {
                        zipFile.readEntry();
                    });
                    /**
                     * read the steam and parse it to string so that it could be validated against regex
                     */
                    const content = yield readSteam2Data(readStream);
                    /**
                     * check against check list and black list
                     */
                    checkAgainstManifest(matched, fileName, content);
                }));
            }
            else {
                /**
                 * read next file
                 */
                zipFile.readEntry();
            }
        }));
        zipFile.once("end", onComplete);
    });
}
exports.checkAgainstZip = checkAgainstZip;
