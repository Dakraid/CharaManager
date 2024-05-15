// noinspection ES6PreferShortImport

import { createDatabase } from 'db0';
import sqlite from 'db0/connectors/better-sqlite3';
import { drizzle } from 'db0/integrations/drizzle/index';
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
        images.forEach((image) => {
            fs.writeFile(`public/cards/${image.id}.png`, image.content.split('base64,')[1], { encoding: 'base64' }, function (err) {
                if (err) {
                    throw err;
                }
            });
        });
    } catch (err) {
        return new ApiResponse(StatusCode.INTERNAL_SERVER_ERROR, 'Error occurred during the writing process.', err);
    }

    return new ApiResponse(StatusCode.OK, 'Wrote all images to disk.');
});
