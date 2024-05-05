import extractChunks from 'png-chunks-extract';
import { decode } from 'png-chunk-text';
import * as Cards from 'character-card-utils';

const read = (image: Uint8Array) => {
    const chunks = extractChunks(image);

    const textChunks = chunks
        .filter(function (chunk) {
            return chunk.name === 'tEXt';
        })
        .map(function (chunk) {
            return decode(chunk.data);
        });

    if (textChunks.length === 0) {
        console.error('PNG metadata does not contain any text chunks.');
        throw new Error('No PNG metadata.');
    }

    const index = textChunks.findIndex((chunk) => chunk.keyword.toLowerCase() == 'chara');

    if (index === -1) {
        console.error('PNG metadata does not contain any character data.');
        throw new Error('No PNG metadata.');
    }

    return atob(textChunks[index].text);
};

function base64ToArrayBuffer(base64: string) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

export default function (content: string | undefined) {
    if (content === undefined || content.length === 0) {
        throw "Content is undefined.";
    }

    const array = base64ToArrayBuffer(content.split('base64,')[1]);
    const parsed = JSON.parse(read(array));
    return Cards.parseToV2(parsed);
}
