import type { Database } from 'db0';
import { createDatabase } from 'db0';
import sqlite from 'db0/connectors/better-sqlite3';
import { drizzle } from 'db0/integrations/drizzle/index';
import { ApiResponse } from '~/models/ApiResponse';
import type DatabaseRequest from '~/models/DatabaseRequest';
import StatusCode from '~/models/enums/StatusCode';
import { character_definitions, character_details, character_images } from '~/utils/drizzle/schema';

async function PurgeDatabase(db: Database) {
    const drizzleDb = drizzle(db);

    await drizzleDb.delete(character_definitions);
    await drizzleDb.delete(character_images);
    await drizzleDb.delete(character_details);

    return new ApiResponse(StatusCode.OK, 'Deleted all content from database.');
}

// noinspection JSUnusedGlobalSymbols
export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event);

    const apiKey = event.headers.get('x-api-key');
    if (!apiKey || apiKey !== config.apiKey) {
        return new ApiResponse(StatusCode.FORBIDDEN, 'Missing or invalid API key given.');
    }

    const db = createDatabase(sqlite({ name: 'CharaManager' }));

    try {
        return await PurgeDatabase(db);
    } catch (err) {
        event.context.logger.error(err);
        return new ApiResponse(StatusCode.INTERNAL_SERVER_ERROR, 'An unexpected error occurred.', err);
    }
});
