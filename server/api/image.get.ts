// noinspection ES6PreferShortImport

import { createDatabase } from 'db0';
import sqlite from 'db0/connectors/better-sqlite3';
import { drizzle } from 'db0/integrations/drizzle/index';
import { eq } from 'drizzle-orm';
import ApiResponse from '~/models/ApiResponse';
import StatusCode from '~/models/enums/StatusCode';
import { character_images } from '~/utils/drizzle/schema';

// noinspection JSUnusedGlobalSymbols
export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    if (!query.id || !Number(query.id)) {
        return new ApiResponse(StatusCode.BAD_REQUEST, 'Missing route parameter id or non-numeric id transmitted.');
    }

    const id = Number(query.id);
    const db = createDatabase(sqlite({ name: 'CharaManager' }));
    const drizzleDb = drizzle(db);

    const result = await drizzleDb.select().from(character_images).where(eq(character_images.id, id));

    if (result.length === 0) {
        return new ApiResponse(StatusCode.NOT_FOUND, `No character with ID ${id} found.`);
    }

    return new ApiResponse(StatusCode.OK, 'Character retrieved.', result[0]);
});
