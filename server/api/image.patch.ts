import { createDatabase } from 'db0';
import sqlite from 'db0/connectors/better-sqlite3';
import { drizzle } from 'db0/integrations/drizzle/index';
import Jimp from 'jimp-compact';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
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

    const body = await readBody(event);
    if (!body) {
        return new ApiResponse(StatusCode.BAD_REQUEST, 'The request body is malformed or corrupted.');
    }

    const db = createDatabase(sqlite({ name: 'CharaManager' }));
    const drizzleDb = drizzle(db);

    let base64Image: string;
    let base64ImageSmall: string;

    try {
        const buffer = Buffer.from(body.File, 'base64');
        const rawImg = await Jimp.read(buffer);
        const image = await rawImg.getBufferAsync(Jimp.MIME_PNG);
        base64Image = image.toString('base64');
    } catch (err) {
        event.context.logger.error(err);
        return new ApiResponse(StatusCode.INTERNAL_SERVER_ERROR, 'Failed to convert character image.', err);
    }

    const definition = await $fetch<ApiResponse>('/api/definition', {
        method: 'GET',
        headers: { 'x-api-key': config.apiKey },
        query: { id: body.Id },
    });

    if (definition.Status !== StatusCode.OK) {
        return new ApiResponse(StatusCode.INTERNAL_SERVER_ERROR, 'Failed to get character definition.');
    }

    let updatedImage: string;

    try {
        updatedImage = convertStringToBase64PNG(base64Image, definition.Content.json);
    } catch (err) {
        event.context.logger.error(err);
        return new ApiResponse(StatusCode.INTERNAL_SERVER_ERROR, 'Failed to convert character image.', err);
    }

    try {
        const hash = createHash('sha256').update(updatedImage).digest('hex');

        const image = Buffer.from(updatedImage.split('base64,')[1], 'base64');
        const rawImg = await Jimp.read(image);
        const thumbnail = await rawImg.resize(Jimp.AUTO, 384).getBufferAsync(Jimp.MIME_PNG);

        await drizzleDb
            .insert(character_images)
            .values({ id: body.Id, content: image, content_small: thumbnail, hash: hash })
            .onConflictDoUpdate({ target: character_images.id, set: { content: image, content_small: thumbnail } });
    } catch (err) {
        event.context.logger.error(err);
        return new ApiResponse(StatusCode.INTERNAL_SERVER_ERROR, 'Failed to upsert character image.', err);
    }

    return new ApiResponse(StatusCode.OK, 'Updated image successfully.', 'To see the updated image in gallery, refresh the page.');
});
