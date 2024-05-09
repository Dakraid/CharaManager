// noinspection ES6PreferShortImport

import { createDatabase } from 'db0';
import sqlite from 'db0/connectors/better-sqlite3';
import { drizzle } from 'db0/integrations/drizzle/index';
import { createHash } from 'node:crypto';
import { characterDefinitions } from '~/utils/drizzle/schema';
import type { Character } from '~/models/Character';
import cleanCharacterBook from '~/server/utils/cleanCharacterBook';
import convertBase64PNGToString from '~/server/utils/convertBase64PNGToString';

export default defineEventHandler(async (event) => {
    const body = await readBody<Character>(event);
    if (!body) {
        return null;
    }

    const db = createDatabase(sqlite({ name: 'CharaManager' }));
    const drizzleDb = drizzle(db);

    try {
        const contentString = convertBase64PNGToString(body.image_content);
        const content = await cleanCharacterBook(contentString);
        const hash = createHash('sha256').update(content).digest('hex');
        await drizzleDb
            .insert(characterDefinitions)
            .values({ id: body.id, hash: hash, json: content })
            .onConflictDoUpdate({ target: characterDefinitions.id, set: { hash: hash, json: content } });
        console.log('Added definition for character with ID ' + body.id);
    } catch (e) {
        console.error('Failed to insert character with ID ' + body.id + ' into definition table: ' + e);
    }
});
