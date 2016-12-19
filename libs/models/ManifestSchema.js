"use strict";
const schema = require('js-schema');
const manifestValidate = schema({
    'checkList': {
        '*': Array.of(String)
    },
    'blackList': {
        '*': Array.of(String)
    }
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = manifestValidate;
