import fs from 'fs';

export function extractReqInfo(req: any) {
    return {
        url: req.url,
        method: req.method,
        headers: req.headers,
    };
}

export function mkdirIfNotExists(dir: string) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
}

export function checkHeadersAccepts(headers: any, accepted: any) {
    const hasAcceptHeaders = headers.accept;
    if (hasAcceptHeaders) {
        return accepted.some((x: any) => headers.accept.includes(x));
    }
    return false;
}

export function checkHeadersContentType(headers: any, contentTypes: any) {
    const hasContentType = headers['content-type'];
    if (hasContentType) {
        return contentTypes.some((x: any) => headers['content-type'].includes(x));
    }
    return false;
}
