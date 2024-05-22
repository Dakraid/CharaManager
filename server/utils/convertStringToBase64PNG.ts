import * as pngText from 'png-chunk-text';
import encode from 'png-chunks-encode';
import extractChunks from 'png-chunks-extract';
import b64EncodeUnicode from '~/server/utils/b64EncodeUnicode';

export default function convertStringToBase64PNG(image: string, newContent: string) {
    let fileString = image;
    if (fileString.includes('base64')) {
        fileString = image.split('base64,')[1];
    }
    const contentArray = Buffer.from(fileString, 'base64');
    const chunks = extractChunks(contentArray);
    const modifiedText = b64EncodeUnicode(newContent);

    if (chunks.length > 1) {
        const tEXtChunks = chunks.filter((chunk) => chunk.name === 'tEXt');

        for (const tEXtChunk of tEXtChunks) {
            chunks.splice(chunks.indexOf(tEXtChunk), 1);
        }
    }

    chunks.splice(-1, 0, pngText.encode('chara', modifiedText));
    return 'data:image/png;base64,' + Buffer.from(encode(chunks)).toString('base64');
}
