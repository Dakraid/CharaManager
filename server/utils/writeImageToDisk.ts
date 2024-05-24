import Jimp from 'jimp-compact';
import fs from 'node:fs';

export default async function writeImageToDisk(id: number, base64Image: string) {
    if (base64Image.includes('base64,')) {
        base64Image = base64Image.split('base64,')[1];
    }

    if (!fs.existsSync('public/cards/')) {
        fs.mkdirSync('public/cards/');
    }

    fs.writeFile(`public/cards/${id}.png`, base64Image, { encoding: 'base64' }, function (err) {
        if (err) {
            console.error(err);
            throw err;
        }
    });

    const buffer = Buffer.from(base64Image, 'base64');
    const rawImg = await Jimp.read(buffer);
    const smallImage = await rawImg.resize(Jimp.AUTO, 384).getBufferAsync(Jimp.MIME_PNG);

    fs.writeFile(`public/cards/${id}-small.png`, smallImage.toString('base64'), { encoding: 'base64' }, function (err) {
        if (err) {
            console.error(err);
            throw err;
        }
    });
}
