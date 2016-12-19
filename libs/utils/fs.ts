import * as fs from 'fs';
import * as yauzl from 'yauzl';
import {Stream} from 'stream';

/**
 *  wrap fs readFile with a promise so that enables to use async/await
 */
export function readFileAsyncPromise(filename: string): Promise<string> {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, (err: NodeJS.ErrnoException, data: Buffer) => {
            err ? reject(err) : resolve(data.toString());
        });
    });
}

/**
 * read the file and convert to json
 */
export async function readFileAsyncPromiseAsJson<T>(filename: string): Promise<T> {
    return JSON.parse(await readFileAsyncPromise(filename));
}

/**
 * read through all the chunk and pass it to data as well as convert to string
 *
 * the following might cause memory crash for server application
 * however, since each entry will dump after read, memory should not be a main issue in this case.
 * report in my github if exception throws due to extremely large file
 */
function readSteam2Data(readStream: Stream): Promise<string> {
    return new Promise((resolve, reject) => {
        let data = ``;
        readStream
            .on('data', function (chunk) {
                data += chunk;
            })
            .once('error', (err: Error) => {
                reject(err);
            })
            .on('finish', function () {
                resolve(data);
            });
    })
}

/**
 * read a specific zip file and expose two callback for custom process
 * @param zipFilePath {string} target zip file path, could be relative or absolute path
 * @param validateFileName {Function} validate filename obtained from zip file, check if it's match the pattern of manifest. if true, open it for more content
 * @param checkAgainstManifest {Function} check whether the content is valid against manifest file
 * @param onComplete {Function} a callback function indicate the entire process is done
 */
export function checkAgainstZip(zipFilePath: string,
                                validateFileName: (fileName: string) => string[],
                                checkAgainstManifest: (matchPatterns: string[], fileAbsPath: string, content: string) => void,
                                onComplete: () => void) {
    /**
     * open the zip file
     * lazyEntries: This allows processing of one entry at a time, and will keep memory usage under control for zip files with many entries.
     */
    yauzl.open(zipFilePath, {lazyEntries: true}, (err, zipFile) => {
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
        zipFile.on(`entry`, async(entry) => {
            /**
             * get entry file name
             */
            const {fileName} = entry;
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
                zipFile.openReadStream(entry, async(err, readStream) => {
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
                    const content = await readSteam2Data(readStream);
                    /**
                     * check against check list and black list
                     */
                    checkAgainstManifest(matched, fileName, content);
                });
            } else {
                /**
                 * read next file
                 */
                zipFile.readEntry();
            }
        });

        zipFile.once("end", onComplete);
    });
}