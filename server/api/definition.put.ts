import * as Cards from 'character-card-utils';
import { createDatabase } from 'db0';
import sqlite from 'db0/connectors/better-sqlite3';
import { drizzle } from 'db0/integrations/drizzle/index';
import { eq } from 'drizzle-orm';
import { createHash } from 'node:crypto';
import ApiResponse from '~/models/ApiResponse';
import type PutDefinitionRequest from '~/models/PutDefinitionRequest';
import PutImageRequest from '~/models/PutImageRequest';
import StatusCode from '~/models/enums/StatusCode';
import cleanCharacterBook from '~/server/utils/cleanCharacterBook';
import convertBase64PNGToString from '~/server/utils/convertBase64PNGToString';
import { character_definitions, character_images } from '~/utils/drizzle/schema';

// noinspection JSUnusedGlobalSymbols
export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event);

    const apiKey = event.headers.get('x-api-key');
    if (!apiKey || apiKey !== config.apiKey) {
        return new ApiResponse(StatusCode.FORBIDDEN, 'Missing or invalid API key given.');
    }

    const body = await readBody<PutDefinitionRequest>(event);
    if (!body) {
        return new ApiResponse(StatusCode.BAD_REQUEST, 'The request body is malformed or corrupted.');
    }

    const db = createDatabase(sqlite({ name: 'CharaManager' }));
    const drizzleDb = drizzle(db);

    try {
        const cleanedContent = await cleanCharacterBook(body.Json);
        const hash = createHash('sha256').update(cleanedContent).digest('hex');
        await drizzleDb
            .insert(character_definitions)
            .values({ id: body.Id, hash: hash, json: cleanedContent })
            .onConflictDoUpdate({ target: character_definitions.id, set: { hash: hash, json: cleanedContent } });

        if (!body.DefinitionOnly) {
            const image = (await drizzleDb.select().from(character_images).where(eq(character_images.id, body.Id)))[0];

            await $fetch<ApiResponse>('/api/image', {
                method: 'PUT',
                headers: { 'x-api-key': config.apiKey },
                body: JSON.stringify(new PutImageRequest(body.Id, convertStringToBase64PNG(image.content.toString('base64'), cleanedContent))),
            });
        }

        return new ApiResponse(StatusCode.OK, `Upserted definition for character with ID ${body.Id}`);
    } catch (err) {
        event.context.logger.error(err);
        return new ApiResponse(StatusCode.INTERNAL_SERVER_ERROR, `Failed to upsert character definition with ID ${body.Id}`, err);
    }
});
