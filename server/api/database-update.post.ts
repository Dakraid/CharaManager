// noinspection ES6PreferShortImport

import { Character } from '~/models/Character';
import {createDatabase} from "db0";
import sqlite from "db0/connectors/better-sqlite3";
import {drizzle} from "db0/integrations/drizzle/index";
import {characterCards} from "~/utils/drizzle/schema";
import convertBase64PNGToString from "~/server/utils/convertBase64PNGToString";
import * as Cards from "character-card-utils";
import type { SQL} from "drizzle-orm";
import {inArray, sql} from "drizzle-orm";
import {status_success_database_updated} from "~/models/StatusResponses";

export default defineEventHandler(async (event) => {
    const db = createDatabase(sqlite({ name: 'CharaManager' }));
    const drizzleDb = drizzle(db);

    const rawCharacters = await drizzleDb.select().from(characterCards);
    const characters: Character[] = rawCharacters.map((character) =>
        new Character(character.hash, character.full_name, character.file_name, character.timestamp, character.formatted_timestamp, character.image_content, character.id));

    const updatedCharacters: Character[] = [];
    for (const character of characters) {
        const content = JSON.parse(convertBase64PNGToString(character.image_content));
        if (!content.data) {
            const converted = Cards.v1ToV2(content);
            character.image_content = convertStringToBase64PNG(character.image_content, JSON.stringify(converted));
            updatedCharacters.push(character);
        }
    }

    if (updatedCharacters.length === 0) {
        const response = status_success_database_updated;
        response.content = "No characters to update.";
        return response;
    }

    const sqlChunks: SQL[] = [];
    const ids: number[] = [];
    sqlChunks.push(sql`(case`);
    for (const updatedCharacter of updatedCharacters) {
        sqlChunks.push(sql`when ${characterCards.id} = ${updatedCharacter.id} then ${updatedCharacter.image_content}`);
        ids.push(<number>updatedCharacter.id);
    }
    sqlChunks.push(sql`end)`);
    const finalSql: SQL = sql.join(sqlChunks, sql.raw(' '));
    await drizzleDb.update(characterCards).set({ image_content: finalSql }).where(inArray(characterCards.id, ids));

    const response = status_success_database_updated;
    response.content = "Updated " + ids.length + " characters.";
    return response;
});
