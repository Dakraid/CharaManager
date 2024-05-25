import { createDatabase } from 'db0';
import sqlite from 'db0/connectors/better-sqlite3';
import { drizzle } from 'db0/integrations/drizzle/index';
import { eq } from 'drizzle-orm';
import Jimp from 'jimp-compact';
import ApiResponse from '~/models/ApiResponse';
import StatusCode from '~/models/enums/StatusCode';
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
            const buffer = Buffer.from(image.content.split('base64,')[1], 'base64');
            const rawImg = await Jimp.read(buffer);
            const smallImage = await rawImg.resize(Jimp.AUTO, 384).getBufferAsync(Jimp.MIME_PNG);

            await drizzleDb.update(character_images).set({ content_small: 'data:image/png;base64,' + smallImage.toString('base64') }).where(eq(character_images.id, image.id));
        }
    } catch (err) {
        event.context.logger.error(err);
        return new ApiResponse(StatusCode.INTERNAL_SERVER_ERROR, 'Error occurred during the writing process.', err);
    }

    return new ApiResponse(StatusCode.OK, 'Wrote all images to disk.');
});
