// noinspection ES6PreferShortImport

import { createDatabase } from 'db0';
import sqlite from 'db0/connectors/better-sqlite3';
import { drizzle } from 'db0/integrations/drizzle/index';
import { eq } from 'drizzle-orm';
import { characterCards, characterDefinitions } from '~/utils/drizzle/schema';
import type { CharactersDeleteRequest } from '~/models/CharactersDeleteRequest';
import { status_failure_characters_deleted, status_success_characters_all_deleted, status_success_characters_deleted } from '~/models/StatusResponses';

export default defineEventHandler(async (event) => {
    const body = await readBody<CharactersDeleteRequest>(event);
    if (!body) {
        return null;
    }

    const db = createDatabase(sqlite({ name: 'CharaManager' }));
    const drizzleDb = drizzle(db);

    if (body.purge === true) {
        await drizzleDb.delete(characterDefinitions);
        await drizzleDb.delete(characterCards);
        return status_success_characters_all_deleted;
    }

    try {
        await drizzleDb.delete(characterDefinitions).where(eq(characterDefinitions.id, body.id));
    } catch {
        console.log('Character with ID ' + body.id + ' had no definition.');
    }
    const deletedUserIds: { deletedId: number }[] = await drizzleDb.delete(characterCards).where(eq(characterCards.id, body.id)).returning({ deletedId: characterCards.id });

    if (deletedUserIds.length === 0) {
        return status_failure_characters_deleted;
    }

    const response = status_success_characters_deleted;
    response.content = deletedUserIds;
    return response;
});
