import * as Cards from 'character-card-utils';
import type { Database } from 'db0';
import { createDatabase } from 'db0';
import sqlite from 'db0/connectors/better-sqlite3';
import { drizzle } from 'db0/integrations/drizzle/index';
import type { SQL } from 'drizzle-orm';
import { inArray, sql } from 'drizzle-orm';
import { createHash } from 'node:crypto';
import { ApiResponse } from '~/models/ApiResponse';
import type DatabaseRequest from '~/models/DatabaseRequest';
import { DatabaseAction } from '~/models/enums/DatabaseAction';
import StatusCode from '~/models/enums/StatusCode';
import cleanCharacterBook from '~/server/utils/cleanCharacterBook';
import convertBase64PNGToString from '~/server/utils/convertBase64PNGToString';
import { character_definitions, character_images } from '~/utils/drizzle/schema';

async function ProvisionDatabase(db: Database) {
    await db.sql`CREATE TABLE IF NOT EXISTS character_details (
		id integer primary key autoincrement UNIQUE,
		hash text NOT NULL,
		full_name text NOT NULL,
		file_name text NOT NULL,
		timestamp integer NOT NULL,
		formatted_timestamp text NOT NULL,
		rating integer DEFAULT 0 NOT NULL
	  )`;

    await db.sql`CREATE TABLE IF NOT EXISTS character_images (
          id integer primary key NOT NULL UNIQUE,
          content text NOT NULL,
          hash text NOT NULL,
          FOREIGN KEY(id) REFERENCES character_details(id)
	  )`;

    await db.sql`CREATE TABLE IF NOT EXISTS character_definitions (
        id integer primary key NOT NULL UNIQUE,
		hash text NOT NULL,
        json text NOT NULL,
        FOREIGN KEY(id) REFERENCES character_details(id)
	  )`;

    await db.sql`CREATE TABLE IF NOT EXISTS character_relations (
        id integer primary key autoincrement UNIQUE,
		current_id integer NOT NULL,
        old_id integer NOT NULL,
        FOREIGN KEY(current_id) REFERENCES character_details(id),
        FOREIGN KEY(old_id) REFERENCES character_details(id),
        UNIQUE("current_id","old_id")
	  )`;

    return new ApiResponse(StatusCode.OK, 'Database connection established.');
}

async function UpdateDatabase(db: Database) {
    const config = useRuntimeConfig();

    const drizzleDb = drizzle(db);

    const images = await drizzleDb.select().from(character_images);

    const updatedItems = [];
    for (const image of images) {
        const content = JSON.parse(convertBase64PNGToString(image.content));
        if (!content.data) {
            const converted = Cards.v1ToV2(content);
            image.content = convertStringToBase64PNG(image.content, JSON.stringify(converted));
            updatedItems.push(image);
        }
    }

    if (updatedItems.length < 1) {
        return new ApiResponse(StatusCode.OK, 'No v1 cards found to be updated.');
    }

    const sqlChunks: SQL[] = [];
    const imageIDs: number[] = [];
    sqlChunks.push(sql`(case`);
    for (const updatedItem of updatedItems) {
        sqlChunks.push(sql`when ${character_images.id} = ${updatedItem.id} then ${updatedItem.content}`);
        imageIDs.push(updatedItem.id);
    }
    sqlChunks.push(sql`end)`);

    const finalSql: SQL = sql.join(sqlChunks, sql.raw(' '));
    await drizzleDb.update(character_images).set({ content: finalSql }).where(inArray(character_images.id, imageIDs));

    const response = await $fetch<ApiResponse>('/api/images', {
        method: 'POST',
        headers: { 'x-api-key': config.apiKey },
    });

    if (response.Status !== StatusCode.OK) {
        return new ApiResponse(StatusCode.INTERNAL_SERVER_ERROR, 'Failed to update images.', response.Content);
    }

    return new ApiResponse(StatusCode.OK, `Updated ${imageIDs.length} characters.`);
}

async function SynchronizeDatabase(db: Database) {
    const drizzleDb = drizzle(db);

    const images = await drizzleDb.select().from(character_images).all();
    for (const image of images) {
        try {
            const contentString = convertBase64PNGToString(image.content);
            const contentJson = await cleanCharacterBook(contentString);
            const hash = createHash('sha256').update(contentJson).digest('hex');
            await drizzleDb
                .insert(character_definitions)
                .values({ id: image.id, hash: hash, json: contentJson })
                .onConflictDoUpdate({ target: character_definitions.id, set: { hash: hash, json: contentJson } });
        } catch (err) {
            console.error('Failed to upsert definition for character with ID ' + image.id + ': ' + err);
        }
    }

    return new ApiResponse(StatusCode.OK, 'Synchronized all characters and their definitions.');
}

// noinspection JSUnusedGlobalSymbols
export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event);

    const apiKey = event.headers.get('x-api-key');
    if (!apiKey || apiKey !== config.apiKey) {
        return new ApiResponse(StatusCode.FORBIDDEN, 'Missing or invalid API key given.');
    }

    const body = await readBody<DatabaseRequest>(event);
    if (!body) {
        return new ApiResponse(StatusCode.BAD_REQUEST, 'The request body is malformed or corrupted.');
    }

    const db = createDatabase(sqlite({ name: 'CharaManager' }));

    try {
        switch (body.Action) {
            case DatabaseAction.Provision:
                return await ProvisionDatabase(db);
            case DatabaseAction.Update:
                return await UpdateDatabase(db);
            case DatabaseAction.Synchronize:
                return await SynchronizeDatabase(db);
        }
    } catch (err) {
        event.context.logger.error(err);
        return new ApiResponse(StatusCode.INTERNAL_SERVER_ERROR, 'An unexpected error occurred.', err);
    }
});
