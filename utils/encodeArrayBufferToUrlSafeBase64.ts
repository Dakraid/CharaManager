// Converts an ArrayBuffer directly to base64, without any intermediate 'convert to string then
// use window.btoa' step. According to my tests, this appears to be a faster approach:
// http://jsperf.com/encoding-xhr-image-data/5

/*
MIT LICENSE
Copyright 2011 Jon Leighton
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/*
Modified by LittleSaya at 2022/10/19, 2022/11/4
*/

// Base 64 Encoding with URL and Filename Safe Alphabet
// https://datatracker.ietf.org/doc/html/rfc4648#section-5
const encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

export default function encodeArrayBufferToUrlSafeBase64(arrayBuffer: ArrayBuffer): string {
    let base64 = '';

    const bytes = new Uint8Array(arrayBuffer);
    const byteLength = bytes.byteLength;
    const byteRemainder = byteLength % 3;
    const mainLength = byteLength - byteRemainder;

    let a, b, c, d;
    let chunk;

    // Main loop deals with bytes in chunks of 3
    for (let i = 0; i < mainLength; i = i + 3) {
        // Combine the three bytes into a single integer
        chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];

        // Use bitmasks to extract 6-bit segments from the triplet
        a = (chunk & 16515072) >> 18; // 16515072 = (2^6 - 1) << 18
        b = (chunk & 258048) >> 12; // 258048   = (2^6 - 1) << 12
        c = (chunk & 4032) >> 6; // 4032     = (2^6 - 1) << 6
        d = chunk & 63; // 63       = 2^6 - 1

        // Convert the raw binary segments to the appropriate ASCII encoding
        base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
    }

    // Deal with the remaining bytes and padding
    if (byteRemainder === 1) {
        chunk = bytes[mainLength];

        a = (chunk & 252) >> 2; // 252 = (2^6 - 1) << 2

        // Set the 4 least significant bits to zero
        b = (chunk & 3) << 4; // 3   = 2^2 - 1

        base64 += encodings[a] + encodings[b]; // + '=='
    } else if (byteRemainder === 2) {
        chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];

        a = (chunk & 64512) >> 10; // 64512 = (2^6 - 1) << 10
        b = (chunk & 1008) >> 4; // 1008  = (2^6 - 1) << 4

        // Set the 2 least significant bits to zero
        c = (chunk & 15) << 2; // 15    = 2^4 - 1

        base64 += encodings[a] + encodings[b] + encodings[c]; // + '='
    }

    return base64;
}

function charCodeToNumber(charCode: number): number {
    if (charCode >= 65 && charCode <= 90) {
        return charCode - 65;
    } else if (charCode >= 97 && charCode <= 122) {
        return charCode - 71;
    } else if (charCode >= 48 && charCode <= 57) {
        return charCode + 4;
    } else if (charCode === 45) {
        return 62;
    } else if (charCode === 95) {
        return 63;
    } else {
        throw new Error('Invalid char code in url safe base64: ' + charCode);
    }
}

export function decodeUrlSafeBase64ToArrayBuffer(str: string): ArrayBuffer {
    const mod4 = str.length % 4;
    let mainByteLength = 0;
    let mainStringLength = 0;
    let restByteLength = 0;
    if (mod4 === 0) {
        mainByteLength = (str.length / 4) * 3;
        mainStringLength = str.length;
    } else if (mod4 === 1) {
        throw new Error('invalid url safe base64 encoded string: ' + str);
    } else if (mod4 === 2) {
        mainByteLength = ((str.length - 2) / 4) * 3;
        mainStringLength = str.length - 2;
        restByteLength = 1;
    } else {
        mainByteLength = ((str.length - 3) / 4) * 3;
        mainStringLength = str.length - 3;
        restByteLength = 2;
    }

    // 3-byte chunk
    let chunk;
    const resultBuffer = new Uint8Array(mainByteLength + restByteLength);

    // process main string
    let a, b, c, d;
    for (let i = 0, j = 0; i < mainStringLength; i += 4, j += 3) {
        a = charCodeToNumber(str.charCodeAt(i));
        b = charCodeToNumber(str.charCodeAt(i + 1));
        c = charCodeToNumber(str.charCodeAt(i + 2));
        d = charCodeToNumber(str.charCodeAt(i + 3));
        chunk = (a << 18) + (b << 12) + (c << 6) + d;
        resultBuffer.set([(chunk & 0xff0000) >> 16, (chunk & 0x00ff00) >> 8, chunk & 0x0000ff], j);
    }

    // process rest string
    if (mod4 === 2) {
        // 1 byte remain
        a = charCodeToNumber(str.charCodeAt(mainStringLength));
        b = charCodeToNumber(str.charCodeAt(mainStringLength + 1));
        chunk = (a << 2) + (b >> 4);
        resultBuffer.set([chunk & 0xff], mainByteLength);
    } else if (mod4 === 3) {
        // 2 bytes remain
        a = charCodeToNumber(str.charCodeAt(mainStringLength));
        b = charCodeToNumber(str.charCodeAt(mainStringLength + 1));
        c = charCodeToNumber(str.charCodeAt(mainStringLength + 2));
        chunk = (a << 10) + (b << 4) + (c >> 2);
        resultBuffer.set([(chunk & 0xff00) >> 8, chunk & 0x00ff], mainByteLength);
    }

    return resultBuffer;
}
