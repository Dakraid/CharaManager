import { createDatabase } from 'db0';
import sqlite from 'db0/connectors/better-sqlite3';
import { drizzle } from 'db0/integrations/drizzle/index';
import { eq } from 'drizzle-orm';
import Jimp from 'jimp-compact';
import { createHash } from 'node:crypto';
import * as fs from 'node:fs';
import ApiResponse from '~/models/ApiResponse';
import type GetCharactersRequest from '~/models/GetCharactersRequest';
import type GetImagesRequest from '~/models/GetImagesRequest';
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

    const body = await readBody<GetImagesRequest>(event);
    if (!body) {
        return new ApiResponse(StatusCode.BAD_REQUEST, 'The request body is malformed or corrupted.');
    }

    const db = createDatabase(sqlite({ name: 'CharaManager' }));
    const drizzleDb = drizzle(db);

    if (body.Reduced) {
        const images = await drizzleDb.select({ id: character_images.id, content_small: character_images.content_small }).from(character_images).all();
        return new ApiResponse(StatusCode.OK, 'Retrieved images from database.', images);
    }

    const images = await drizzleDb.select().from(character_images).all();
    return new ApiResponse(StatusCode.OK, 'Retrieved images from database.', images);
});
