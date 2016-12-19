const schema = require('js-schema');
const manifestValidate = schema({
    'checkList': {
        '*': Array.of(String)
    },
    'blackList': {
        '*': Array.of(String)
    }
});

export default manifestValidate;