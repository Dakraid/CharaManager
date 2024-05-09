import extractChunks from "png-chunks-extract";
import b64EncodeUnicode from "~/server/utils/b64EncodeUnicode";
import * as pngText from "png-chunk-text";
import encode from "png-chunks-encode";

export default function convertStringToBase64PNG(image: string, newContent: string) {
    const contentArray = Buffer.from(image.split('base64,')[1], 'base64');
    const chunks = extractChunks(contentArray);
    const modifiedText = b64EncodeUnicode(newContent);

    const tEXtChunks = chunks.filter((chunk) => chunk.name === 'tEXt');

    for (const tEXtChunk of tEXtChunks) {
        chunks.splice(chunks.indexOf(tEXtChunk), 1);
    }

    chunks.splice(-1, 0, pngText.encode('chara', modifiedText));
    return image.split('base64,')[0] + 'base64,' + Buffer.from(encode(chunks)).toString('base64');
}
