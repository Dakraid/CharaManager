import { createDatabase } from 'db0';
import sqlite from 'db0/connectors/better-sqlite3';
import { drizzle } from 'db0/integrations/drizzle/index';
import { eq } from 'drizzle-orm';
import fs, { constants } from 'node:fs';
import ApiResponse from '~/models/ApiResponse';
import type DeleteCharacterRequest from '~/models/DeleteCharacterRequest';
import StatusCode from '~/models/enums/StatusCode';
import { character_definitions, character_details, character_images, character_relations } from '~/utils/drizzle/schema';

// noinspection JSUnusedGlobalSymbols
export default defineEventHandler(async (event) => {
    const body = await readBody<DeleteCharacterRequest>(event);
    if (!body) {
        return new ApiResponse(StatusCode.BAD_REQUEST, 'The request body is malformed or corrupted.');
    }

    const db = createDatabase(sqlite({ name: 'CharaManager' }));
    const drizzleDb = drizzle(db);

    try {
        fs.access(`public/cards/${body.Id}.png`, constants.F_OK, (err) => {
            if (!err) {
                fs.rm(`public/cards/${body.Id}.png`, () => {
                    console.log(`Deleted file ${body.Id}.png`);
                });
            }
        });
    } catch (err) {
        console.error(err);
    }

    try {
        await drizzleDb.delete(character_relations).where(eq(character_relations.current_id, body.Id));
    } catch {
        console.log(`Character with ID ${body.Id} had no image?`);
    }

    try {
        await drizzleDb.delete(character_definitions).where(eq(character_definitions.id, body.Id));
    } catch {
        console.log(`Character with ID ${body.Id} had no definition.`);
    }

    try {
        await drizzleDb.delete(character_images).where(eq(character_images.id, body.Id));
    } catch {
        console.log(`Character with ID ${body.Id} had no image?`);
    }

    try {
        await drizzleDb.delete(character_details).where(eq(character_details.id, body.Id));
    } catch (err) {
        return new ApiResponse(StatusCode.INTERNAL_SERVER_ERROR, `Failed to delete character with ID ${body.Id}.`, err);
    }

    return new ApiResponse(StatusCode.OK, `Deleted character with ID ${body.Id} from tables and disk.`);
});
