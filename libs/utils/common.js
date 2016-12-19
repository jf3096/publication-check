"use strict";
function escapeNewLine(str) {
    return str.replace(/(\r|\n)/igm, '');
}
exports.escapeNewLine = escapeNewLine;
function string2regex(str, flags) {
    const match = str.match(new RegExp('^/(.*?)/([gimy]*)$'));
    return !match ? new RegExp(str, flags) : new RegExp(match[1], match[2]);
}
exports.string2regex = string2regex;
