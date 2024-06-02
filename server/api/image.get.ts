import { createDatabase } from 'db0';
import sqlite from 'db0/connectors/better-sqlite3';
import { drizzle } from 'db0/integrations/drizzle/index';
import { eq } from 'drizzle-orm';
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

    const query = getQuery(event);
    if (!query.id || !Number(query.id)) {
        return new ApiResponse(StatusCode.BAD_REQUEST, 'Missing route parameter id or non-numeric id transmitted.');
    }

    const id = Number(query.id);
    const db = createDatabase(sqlite({ name: 'CharaManager' }));
    const drizzleDb = drizzle(db);

    const images = await drizzleDb.select({ content: character_images.content, content_small: character_images.content_small }).from(character_images).where(eq(character_images.id, id));

    if (images.length === 0) {
        return new ApiResponse(StatusCode.NOT_FOUND, `No character with ID ${id} found.`);
    }

    const result = { content: 'data:image/png;base64,' + images[0].content.toString('base64'), content_small: 'data:image/png;base64,' + images[0].content_small.toString('base64') };

    return new ApiResponse(StatusCode.OK, 'Character image retrieved.', result);
});
