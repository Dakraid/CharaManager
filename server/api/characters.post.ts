// noinspection ES6PreferShortImport

import { createDatabase } from 'db0';
import sqlite from 'db0/connectors/better-sqlite3';
import { drizzle } from 'db0/integrations/drizzle/index';
import { characterCards } from '~/utils/drizzle/schema';
import { asc, desc, like } from 'drizzle-orm';
import { status_failure_characters_get, status_success_characters_get } from '~/models/StatusResponses';
import type { CharactersGetRequest } from '~/models/CharactersGetRequest';

export default defineEventHandler(async (event) => {
    const body = await readBody<CharactersGetRequest>(event);
    if (!body) {
        return null;
    }

    const db = createDatabase(sqlite({ name: 'CharaManager' }));
    const drizzleDb = drizzle(db);

    let characters: any;

    const count = (await drizzleDb.select({ id: characterCards.id }).from(characterCards).all()).length;
    if (count === 0) {
        return status_failure_characters_get;
    }

    if (!body.filter) {
        switch (body.order) {
            case 'alph_asc':
                characters = await drizzleDb
                    .select()
                    .from(characterCards)
                    .orderBy(asc(characterCards.file_name))
                    .offset(body.count * (body.page - 1))
                    .limit(body.count);
                break;
            case 'alph_desc':
                characters = await drizzleDb
                    .select()
                    .from(characterCards)
                    .orderBy(desc(characterCards.file_name))
                    .offset(body.count * (body.page - 1))
                    .limit(body.count);
                break;
            case 'time_asc':
                characters = await drizzleDb
                    .select()
                    .from(characterCards)
                    .orderBy(asc(characterCards.timestamp))
                    .offset(body.count * (body.page - 1))
                    .limit(body.count);
                break;
            case 'time_desc':
                characters = await drizzleDb
                    .select()
                    .from(characterCards)
                    .orderBy(desc(characterCards.timestamp))
                    .offset(body.count * (body.page - 1))
                    .limit(body.count);
                break;
        }
    } else {
        switch (body.order) {
            case 'alph_asc':
                characters = await drizzleDb
                    .select()
                    .from(characterCards)
                    .offset(body.count * (body.page - 1))
                    .limit(body.count)
                    .orderBy(asc(characterCards.file_name))
                    .where(like(characterCards.file_name, '%' + body.filter + '%'));
                break;
            case 'alph_desc':
                characters = await drizzleDb
                    .select()
                    .from(characterCards)
                    .orderBy(desc(characterCards.file_name))
                    .offset(body.count * (body.page - 1))
                    .limit(body.count)
                    .where(like(characterCards.file_name, '%' + body.filter + '%'));
                break;
            case 'time_asc':
                characters = await drizzleDb
                    .select()
                    .from(characterCards)
                    .orderBy(asc(characterCards.timestamp))
                    .offset(body.count * (body.page - 1))
                    .limit(body.count)
                    .where(like(characterCards.file_name, '%' + body.filter + '%'));
                break;
            case 'time_desc':
                characters = await drizzleDb
                    .select()
                    .from(characterCards)
                    .orderBy(desc(characterCards.timestamp))
                    .offset(body.count * (body.page - 1))
                    .limit(body.count)
                    .where(like(characterCards.file_name, '%' + body.filter + '%'));
                break;
        }
    }

    if (characters.length === 0) {
        return status_failure_characters_get;
    }

    const response = status_success_characters_get;
    response.content = characters;
    return response;
});
