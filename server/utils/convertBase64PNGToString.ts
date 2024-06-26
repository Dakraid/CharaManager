import * as pngText from 'png-chunk-text';
import extractChunks from 'png-chunks-extract';
import b64DecodeUnicode from '~/server/utils/b64DecodeUnicode';

export default function convertBase64PNGToString(image: string) {
    let imageString = image;
    if (imageString.includes('base64,')) {
        imageString = imageString.split('base64,')[1];
    }

    const contentArray = Buffer.from(imageString, 'base64');
    const chunks = extractChunks(contentArray);

    const textChunks = chunks
        .filter(function (chunk) {
            return chunk.name === 'tEXt';
        })
        .map(function (chunk) {
            return pngText.decode(chunk.data);
        });

    if (textChunks.length === 0) {
        console.error('PNG metadata does not contain any text chunks.');
    }

    const index = textChunks.findIndex((chunk) => chunk.keyword.toLowerCase() == 'chara');

    if (index === -1) {
        console.error('PNG metadata does not contain any character data.');
    }

    return b64DecodeUnicode(textChunks[index].text);
}
