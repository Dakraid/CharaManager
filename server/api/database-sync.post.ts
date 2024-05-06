// noinspection ES6PreferShortImport

import { createDatabase } from 'db0';
import sqlite from 'db0/connectors/better-sqlite3';
import { drizzle } from 'db0/integrations/drizzle/index';
import { createHash } from 'node:crypto';
import { status_success_database_synced } from '~/models/StatusResponses';
import { characterCards, characterDefinitions } from '~/utils/drizzle/schema';
import cleanCharacterBook from '~/server/utils/cleanCharacterBook';
import * as Cards from 'character-card-utils';

export default defineEventHandler(async (_) => {
    const db = createDatabase(sqlite({ name: 'CharaManager' }));
    const drizzleDb = drizzle(db);

    const characters = await drizzleDb.select({ id: characterCards.id, image_content: characterCards.imageContent }).from(characterCards).all();
    for (const character of characters) {
        try {
            const contentArray = await base64ToArrayBuffer(character.image_content.split('base64,')[1]);
            let contentString = await convertUint8ArrayToString(contentArray);
            const contentJson = JSON.parse(contentString);
            if (contentJson.spec === undefined) {
                const converted = Cards.v1ToV2(contentJson);
                contentString = JSON.stringify(converted);
            }
            const content = await cleanCharacterBook(contentString);
            const hash = createHash('sha256').update(content).digest('hex');
            await drizzleDb
                .insert(characterDefinitions)
                .values({ id: character.id, hash: hash, json: content })
                .onConflictDoUpdate({ target: characterDefinitions.id, set: { hash: hash, json: content } });
            console.log('Added definition for character with ID ' + character.id);
        } catch (e) {
            console.error('Failed to insert character with ID ' + character.id + ' into definition table: ' + e);
        }
    }

    return status_success_database_synced;
});
