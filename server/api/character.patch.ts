// noinspection ES6PreferShortImport

import { createDatabase } from 'db0';
import sqlite from 'db0/connectors/better-sqlite3';
import { drizzle } from 'db0/integrations/drizzle/index';
import { characterCards } from '~/utils/drizzle/schema';
import { eq } from 'drizzle-orm';
import {status_success_character_updated} from "~/models/StatusResponses";
import type {CharacterUpdateRequest} from "~/models/CharacterUpdateRequest";

export default defineEventHandler(async (event) => {
    const body = await readBody<CharacterUpdateRequest>(event);
    if (!body) {
        return null;
    }

    const update = convertStringToBase64PNG(body.character.image_content, body.newContent);

    const db = createDatabase(sqlite({ name: 'CharaManager' }));
    const drizzleDb = drizzle(db);

    const updatedCharacter = await drizzleDb.update(characterCards).set({ image_content: update }).where(eq(characterCards.id, <number>body.character.id)).returning();

    await $fetch('/api/character-details', {
        method: 'PUT',
        body: JSON.stringify(updatedCharacter[0]),
    });

    return status_success_character_updated;
});
