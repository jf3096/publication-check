import * as path from 'path';
import {readFileAsyncPromiseAsJson} from '../utils/fs';
import manifestValidate from './ManifestSchema';

/**
 * enum :)
 */
export const enum ListEnum {
    checkList,
    blackList
}

/**
 * validity item for each manifest item
 */
export interface ValidityItem {
    keyword: string;
    type: ListEnum;
}

/**
 * when the first time read data from manifest json file, the data structure is described as following
 */
type ManifestRawList = {
    [key: string]: string[];
}

/**
 * when the first time read data from manifest json file, the data structure is described as following
 */
interface ManifestJson {
    checkList: ManifestRawList;
    blackList: ManifestRawList;
}

/**
 * the data structure requires to alter for better performance and management purposes
 */
export type ManifestTransformedList = {
    [key: string]: ValidityItem[];
}

/**
 * manifest class could create object to represent target manifest json file
 */
export default class Manifest {
    private readonly manifestPath: string;
    public manifestTransformedList: ManifestTransformedList;

    /**
     * this local variable is used to ensure all the manifest file name found in target zip file
     */
    public touchMarkers: string[];

    /**
     * init and save the manifest as local variable
     */
    public constructor(manifestPath: string) {
        this.manifestPath = manifestPath;
    }

    /**
     * read the transform the manifest file to an object
     */
    public async read(): Promise<Manifest> {
        const {manifestPath} = this;
        /**
         * if manifest path is empty, throw errors
         */
        if (!manifestPath) {
            throw `manifest path is not specified`;
        }
        /**
         * standardise the manifest path
         */
        const cliPath = process.cwd();
        const resolveManifestPath = path.resolve(cliPath, manifestPath);

        /**
         *  read the content
         */
        const content = await readFileAsyncPromiseAsJson<ManifestJson>(resolveManifestPath);

        if (!manifestValidate(content)) {
            /**
             * indent 4 spaces and dump the object as exception
             */
            debugger;
            throw new Error(JSON.stringify(manifestValidate.errors(content), null, 4));
        }

        /**
         * transform it
         */
        this.transform(content.blackList, content.checkList);

        /**
         * create touch markers, this is generated by manifestTransformedList to
         * ensure all manifest settings could be found in target zip file
         */
        this.touchMarkers = Object.keys(this.manifestTransformedList);

        /**
         * supports chainable
         */
        return this;
    }

    /**
     * transform the raw manifest data structure to another form
     * new form will merge all black list and white list together. this allows merging same file pattern so that shorten the validity process
     * @param blackList does not allow to exist in the target content
     * @param checkList must exist at list once in the target content. please use regex if you want to restrict it further
     */
    private transform(blackList: ManifestRawList, checkList: ManifestRawList) {
        /**
         * new data structure variable
         */
        let list = {} as ManifestTransformedList;

        /**
         * traverse black list and check list
         */
        [blackList, checkList].forEach((manifestList: ManifestRawList) => {
            /**
             * differentiate the type
             */
            const type = manifestList === blackList ? ListEnum.blackList : ListEnum.checkList;
            /**
             * loop the manifest list, the path represents target file path
             */
            for (let path in manifestList) {
                /**
                 * each file path has a list of check list and black list
                 */
                const keywords = manifestList[path];
                /**
                 * standardise all path case
                 */
                const lowCasePath = path.toLowerCase();
                /**
                 * skip if keywords is not an array
                 */
                if (Array.isArray(keywords)) {
                    /**
                     * create a data structure
                     */
                    const newList = keywords.map((keyword: string) => {
                        return {keyword, type} as ValidityItem;
                    });

                    /**
                     * merge them to reduce replication
                     *
                     * todo: 测试这里是否能够真正的合并
                     */
                    if (Array.isArray(list[lowCasePath])) {
                        list[lowCasePath] = [...list[lowCasePath], ...newList];
                    }
                    else {
                        list[lowCasePath] = newList;
                    }
                }
            }
        });
        /**
         * save it to local variable
         */
        this.manifestTransformedList = list;
    }
}