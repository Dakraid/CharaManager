import { createDatabase } from 'db0';
import sqlite from 'db0/connectors/better-sqlite3';
import { drizzle } from 'db0/integrations/drizzle/index';
import Jimp from 'jimp-compact';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import ApiResponse from '~/models/ApiResponse';
import PutDefinitionRequest from '~/models/PutDefinitionRequest';
import type PutImageRequest from '~/models/PutImageRequest';
import StatusCode from '~/models/enums/StatusCode';
import convertBase64PNGToString from '~/server/utils/convertBase64PNGToString';
import { character_images } from '~/utils/drizzle/schema';

// noinspection JSUnusedGlobalSymbols
export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event);

    const apiKey = event.headers.get('x-api-key');
    if (!apiKey || apiKey !== config.apiKey) {
        return new ApiResponse(StatusCode.FORBIDDEN, 'Missing or invalid API key given.');
    }

    const body = await readBody<PutImageRequest>(event);
    if (!body) {
        return new ApiResponse(StatusCode.BAD_REQUEST, 'The request body is malformed or corrupted.');
    }

    const db = createDatabase(sqlite({ name: 'CharaManager' }));
    const drizzleDb = drizzle(db);

    let imageString = body.Base64Image;
    if (imageString.includes('base64,')) {
        imageString = imageString.split('base64,')[1];
    }

    try {
        const hash = createHash('sha256').update(body.Base64Image).digest('hex');
        const image = Buffer.from(imageString, 'base64');
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

    const json = convertBase64PNGToString(imageString);
    const response = await $fetch<ApiResponse>('/api/definition', {
        method: 'PUT',
        headers: { 'x-api-key': config.apiKey },
        body: JSON.stringify(new PutDefinitionRequest(body.Id, json, true)),
    });

    if (response.Status !== StatusCode.OK) {
        return new ApiResponse(StatusCode.INTERNAL_SERVER_ERROR, 'Image saved to table and disk, but failed update definition.', response.Content);
    }

    return new ApiResponse(StatusCode.OK, 'Image successfully saved to table and disk, updated definition.');
});
