import { createDatabase } from 'db0';
import sqlite from 'db0/connectors/better-sqlite3';
import { drizzle } from 'db0/integrations/drizzle/index';
import { eq } from 'drizzle-orm';
import Jimp from 'jimp-compact';
import { createHash } from 'node:crypto';
import * as fs from 'node:fs';
import ApiResponse from '~/models/ApiResponse';
import StatusCode from '~/models/enums/StatusCode';
import writeImageToDisk from '~/server/utils/writeImageToDisk';
import { character_images } from '~/utils/drizzle/schema';

// noinspection JSUnusedGlobalSymbols
export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event);

    const apiKey = event.headers.get('x-api-key');
    if (!apiKey || apiKey !== config.apiKey) {
        return new ApiResponse(StatusCode.FORBIDDEN, 'Missing or invalid API key given.');
    }

    const db = createDatabase(sqlite({ name: 'CharaManager' }));
    const drizzleDb = drizzle(db);
    const images = await drizzleDb.select({ id: character_images.id, content: character_images.content }).from(character_images).all();

    try {
        for (const image of images) {
            const hash = createHash('sha256').update(image.content).digest('hex');
            await drizzleDb.update(character_images).set({ hash: hash }).where(eq(character_images.id, image.id));

            try {
                event.context.logger.info(`Writing image for character id ${image.id} to disk.`);
                await writeImageToDisk(image.id, image.content.split('base64,')[1]);
            } catch (err) {
                event.context.logger.error(err);
                return new ApiResponse(StatusCode.INTERNAL_SERVER_ERROR, 'Error occurred during the writing process.', err);
            }
        }
    } catch (err) {
        event.context.logger.error(err);
        return new ApiResponse(StatusCode.INTERNAL_SERVER_ERROR, 'Error occurred during the writing process.', err);
    }

    return new ApiResponse(StatusCode.OK, 'Wrote all images to disk.');
});
