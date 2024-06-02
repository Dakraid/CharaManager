import { createDatabase } from 'db0';
import sqlite from 'db0/connectors/better-sqlite3';
import { drizzle } from 'db0/integrations/drizzle/index';
import { eq } from 'drizzle-orm';
import ApiResponse from '~/models/ApiResponse';
import StatusCode from '~/models/enums/StatusCode';
import { character_details } from '~/utils/drizzle/schema';

// noinspection JSUnusedGlobalSymbols
export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event);

    const apiKey = event.headers.get('x-api-key');
    if (!apiKey || apiKey !== config.apiKey) {
        return new ApiResponse(StatusCode.FORBIDDEN, 'Missing or invalid API key given.');
    }

    const query = getQuery(event);
    if (!query.ids || !Array.isArray(query.ids)) {
        return new ApiResponse(StatusCode.BAD_REQUEST, 'Missing route parameter id or non-numeric id transmitted.');
    }

    const db = createDatabase(sqlite({ name: 'CharaManager' }));
    const drizzleDb = drizzle(db);

    const result = await drizzleDb.select().from(character_details).all();

    if (result.length === 0) {
        return new ApiResponse(StatusCode.NOT_FOUND, 'No characters found.');
    }

    const ids = query.ids.map((id) => Number(id));
    const filteredResults = result.filter((character) => ids.includes(character.id));
    return new ApiResponse(StatusCode.OK, 'Characters retrieved.', filteredResults);
});
