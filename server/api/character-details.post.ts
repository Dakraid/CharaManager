// noinspection ES6PreferShortImport

import { createDatabase } from 'db0';
import sqlite from 'db0/connectors/better-sqlite3';
import { drizzle } from 'db0/integrations/drizzle/index';
import { status_success_character_get } from '~/models/StatusResponses';
import { characterDefinitions } from '~/utils/drizzle/schema';
import type { CharacterDefinitionGetRequest } from '~/models/CharacterDefinitionGetRequest';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
    const body = await readBody<CharacterDefinitionGetRequest>(event);
    if (!body) {
        return null;
    }

    const db = createDatabase(sqlite({ name: 'CharaManager' }));

    const drizzleDb = drizzle(db);
    const character = await drizzleDb.select().from(characterDefinitions).where(eq(characterDefinitions.id, body.id));

    const response = status_success_character_get;
    response.content = character;
    return response;
});
