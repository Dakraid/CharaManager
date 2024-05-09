// noinspection ES6PreferShortImport

import { createHash } from 'node:crypto';
import dayjs from 'dayjs';
import { createDatabase } from 'db0';
import sqlite from 'db0/connectors/better-sqlite3';
import { drizzle } from 'db0/integrations/drizzle/index';
import { characterCards } from '~/utils/drizzle/schema';
import { like } from 'drizzle-orm';
import { Character } from '~/models/Character';
import { status_success_characters_uploaded, status_success_characters_uploaded_withConflict } from '~/models/StatusResponses';
import cleanCharacterBook from '~/server/utils/cleanCharacterBook';
import convertBase64PNGToString from '~/server/utils/convertBase64PNGToString';
import * as Cards from 'character-card-utils';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    if (!body) {
        return null;
    }

    const db = createDatabase(sqlite({ name: 'CharaManager' }));
    const drizzleDb = drizzle(db);

    const fileConflicts: string[] = [];
    for (const file of body.files) {
        const hash = createHash('sha256').update(file.content).digest('hex');
        const char = await drizzleDb.select().from(characterCards).where(like(characterCards.hash, hash));
        if (char.length > 0) {
            fileConflicts.push('File ' + file.name + ' already exists.');
            continue;
        }

        const timestamp = file.lastModified ? file.lastModified : dayjs().unix();
        const newChar = new Character(hash, timestamp + '_' + file.name, file.name, timestamp, dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss'), file.content);

        const content = JSON.parse(convertBase64PNGToString(file.content));
        if (!content.data) {
            const converted = Cards.v1ToV2(content);
            newChar.image_content = convertStringToBase64PNG(file.content, JSON.stringify(converted));
            console.log('Updated character from v1 to v2: ' + file.name);
        }

        const result = await drizzleDb.insert(characterCards).values(newChar).returning({ id: characterCards.id }).onConflictDoNothing();

        newChar.id = result[0].id;
        await $fetch('/api/character-details', {
            method: 'PUT',
            body: JSON.stringify(newChar),
        });
    }

    if (fileConflicts.length > 0) {
        const response = status_success_characters_uploaded_withConflict;
        response.message = fileConflicts.join('\n');
        return response;
    }

    return status_success_characters_uploaded;
});
