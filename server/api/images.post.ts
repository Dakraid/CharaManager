import { createDatabase } from 'db0';
import sqlite from 'db0/connectors/better-sqlite3';
import { drizzle } from 'db0/integrations/drizzle/index';
import ApiResponse from '~/models/ApiResponse';
import type GetImagesRequest from '~/models/GetImagesRequest';
import StatusCode from '~/models/enums/StatusCode';
import { character_images } from '~/utils/drizzle/schema';

// noinspection JSUnusedGlobalSymbols
export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event);

    const apiKey = event.headers.get('x-api-key');
    if (!apiKey || apiKey !== config.apiKey) {
        return new ApiResponse(StatusCode.FORBIDDEN, 'Missing or invalid API key given.');
    }

    const body = await readBody<GetImagesRequest>(event);
    if (!body) {
        return new ApiResponse(StatusCode.BAD_REQUEST, 'The request body is malformed or corrupted.');
    }

    const db = createDatabase(sqlite({ name: 'CharaManager' }));
    const drizzleDb = drizzle(db);

    if (body.Reduced) {
        const images = await drizzleDb.select({ id: character_images.id, content_small: character_images.content_small }).from(character_images).all();
        const filteredImages = images.filter((image) => body.Ids.includes(image.id));
        const convertedImages: { id: number; content_small: string }[] = [];
        filteredImages.forEach((image) => {
            convertedImages.push({ id: image.id, content_small: 'data:image/png;base64,' + image.content_small.toString('base64') });
        });
        return new ApiResponse(StatusCode.OK, 'Retrieved images from database.', convertedImages);
    }

    const images = await drizzleDb.select().from(character_images).all();
    const filteredImages = images.filter((image) => body.Ids.includes(image.id));
    const convertedImages: { id: number; content: string; content_small: string }[] = [];
    filteredImages.forEach((image) => {
        convertedImages.push({ id: image.id, content: 'data:image/png;base64,' + image.content.toString('base64'), content_small: 'data:image/png;base64,' + image.content_small.toString('base64') });
    });
    return new ApiResponse(StatusCode.OK, 'Retrieved images from database.', convertedImages);
});
