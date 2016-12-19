export function escapeNewLine(str: string) {
    return str.replace(/(\r|\n)/igm, '');
}

export function string2regex(str: string, flags: string): RegExp {
    const match = str.match(new RegExp('^/(.*?)/([gimy]*)$'));
    return !match ? new RegExp(str, flags) : new RegExp(match[1], match[2]);
}