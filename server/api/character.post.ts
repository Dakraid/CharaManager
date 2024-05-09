// noinspection ES6PreferShortImport

import { createDatabase } from 'db0';
import sqlite from 'db0/connectors/better-sqlite3';
import { drizzle } from 'db0/integrations/drizzle/index';
import { characterCards } from '~/utils/drizzle/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    if (!body) {
        return null;
    }

    const db = createDatabase(sqlite({ name: 'CharaManager' }));
    const drizzleDb = drizzle(db);

    const result = await drizzleDb.select().from(characterCards).where(eq(characterCards.id, body.id));

    return result[0];
});
