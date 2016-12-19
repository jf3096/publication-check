"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const Manifest_1 = require('../../../libs/models/Manifest');
const chai_configuration_1 = require('../../chai-configuration');
describe('Manifest', () => {
    describe('create a Manifest instance', () => {
        it('should initialize correctly', () => __awaiter(this, void 0, void 0, function* () {
            const path = `test/sample/1/manifest.json`;
            const manifest = new Manifest_1.default(path);
            const { manifestTransformedList } = yield manifest.read();
            Object.keys(manifestTransformedList).forEach((path) => {
                if (path === `/web.config`) {
                    const validityItems = manifestTransformedList[path];
                    chai_configuration_1.default(validityItems[0]).to.be.eqls({ keyword: `hao1hao1`, type: 1 /* blackList */ });
                    chai_configuration_1.default(validityItems[1]).to.be.eqls({ keyword: `dai`, type: 1 /* blackList */ });
                    chai_configuration_1.default(validityItems[2]).to.be.eqls({ keyword: `http://dai.hao1hao1.com/`, type: 0 /* checkList */ });
                    chai_configuration_1.default(validityItems[3]).to.be.eqls({ keyword: `http://www.hao1hao1.com/Api/Pharmacokinetics/GetAppId`, type: 0 /* checkList */ });
                }
            });
        }));
    });
});
