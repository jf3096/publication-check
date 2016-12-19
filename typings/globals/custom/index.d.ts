declare module "yauzl" {
    import {ReadStream} from 'fs';
    namespace yauzl {

        interface IEntry {
            fileName: string;
        }

        interface IZipFile {
            readEntry: () => void;
            on: (event: string, cb: (entry: IEntry) => void) => void;
            once: (event: string, cb: (entry: IEntry) => void) => void;
            openReadStream(entry: IEntry, cb: (err: Error, readStream: ReadStream) => void)
        }

        function open(zipFilePath, {lazyEntries: boolean}, cb: (err: Error, zipFile: IZipFile) => void);
    }
    export = yauzl
}