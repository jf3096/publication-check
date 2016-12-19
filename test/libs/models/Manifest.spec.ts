import Manifest, {ListEnum} from '../../../libs/models/Manifest';
import expect from '../../chai-configuration';
describe('Manifest', () => {
    describe('create a Manifest instance', () => {
        it('should initialize correctly', async() => {
            const path = `test/sample/1/manifest.json`;
            const manifest = new Manifest(path);
            const {manifestTransformedList} = await manifest.read();
            Object.keys(manifestTransformedList).forEach((path) => {
                if (path === `/web.config`) {
                    const validityItems = manifestTransformedList[path];
                    expect(validityItems[0]).to.be.eqls({keyword: `hao1hao1`, type: ListEnum.blackList});
                    expect(validityItems[1]).to.be.eqls({keyword: `dai`, type: ListEnum.blackList});
                    expect(validityItems[2]).to.be.eqls({keyword: `http://dai.hao1hao1.com/`, type: ListEnum.checkList});
                    expect(validityItems[3]).to.be.eqls({keyword: `http://www.hao1hao1.com/Api/Pharmacokinetics/GetAppId`, type: ListEnum.checkList});
                }
            });
        });
    });
});