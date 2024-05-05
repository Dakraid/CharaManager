import { createDatabase } from 'db0';
import sqlite from 'db0/connectors/better-sqlite3';
// noinspection ES6PreferShortImport
import { drizzle } from 'db0/integrations/drizzle/index';
import { characterCards } from '~/utils/drizzle/schema';
import { status_success_characters_count } from '~/models/StatusResponses';

export default defineEventHandler(async (event) => {
    const db = createDatabase(sqlite({ name: 'CharaManager' }));
    const drizzleDb = drizzle(db);
    const count = (await drizzleDb.select({ id: characterCards.id }).from(characterCards).all()).length;

    const response = status_success_characters_count;
    response.message = 'Found ' + count + ' items.';
    response.content = count;
    return response;
});
