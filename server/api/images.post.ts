import { createDatabase } from 'db0';
import sqlite from 'db0/connectors/better-sqlite3';
import { drizzle } from 'db0/integrations/drizzle/index';
import { eq } from 'drizzle-orm';
import { createHash } from 'node:crypto';
import * as fs from 'node:fs';
import ApiResponse from '~/models/ApiResponse';
import StatusCode from '~/models/enums/StatusCode';
import { character_images } from '~/utils/drizzle/schema';

// noinspection JSUnusedGlobalSymbols
export default defineEventHandler(async (event) => {
    const db = createDatabase(sqlite({ name: 'CharaManager' }));
    const drizzleDb = drizzle(db);
    const images = await drizzleDb.select({ id: character_images.id, content: character_images.content }).from(character_images).all();

    try {
        if (!fs.existsSync('public/cards/')) {
            fs.mkdirSync('public/cards/');
        }

        for (const image of images) {
            const hash = createHash('sha256').update(image.content).digest('hex');
            await drizzleDb.update(character_images).set({ hash: hash }).where(eq(character_images.id, image.id));

            fs.writeFile(`public/cards/${image.id}.png`, image.content.split('base64,')[1], { encoding: 'base64' }, function (err) {
                if (err) {
                    throw err;
                }
            });
        }
    } catch (err) {
        return new ApiResponse(StatusCode.INTERNAL_SERVER_ERROR, 'Error occurred during the writing process.', err);
    }

    return new ApiResponse(StatusCode.OK, 'Wrote all images to disk.');
});
