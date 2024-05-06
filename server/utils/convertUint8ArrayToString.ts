import extractChunks from 'png-chunks-extract';
import { decode } from 'png-chunk-text';

export default async function convertUint8ArrayToString(image: Uint8Array) {
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
}
