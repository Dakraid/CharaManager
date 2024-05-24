import { createDatabase } from 'db0';
import sqlite from 'db0/connectors/better-sqlite3';
import { drizzle } from 'db0/integrations/drizzle/index';
import { asc, desc, like } from 'drizzle-orm';
import ApiResponse from '~/models/ApiResponse';
import type GetCharactersRequest from '~/models/GetCharactersRequest';
import StatusCode from '~/models/enums/StatusCode';
import { character_details } from '~/utils/drizzle/schema';

// noinspection JSUnusedGlobalSymbols
export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event);

    const apiKey = event.headers.get('x-api-key');
    if (!apiKey || apiKey !== config.apiKey) {
        return new ApiResponse(StatusCode.FORBIDDEN, 'Missing or invalid API key given.');
    }

    const body = await readBody<GetCharactersRequest>(event);
    if (!body) {
        return new ApiResponse(StatusCode.BAD_REQUEST, 'The request body is malformed or corrupted.');
    }

    const db = createDatabase(sqlite({ name: 'CharaManager' }));
    const drizzleDb = drizzle(db);

    let characters: any;

    const count = (await drizzleDb.select({ id: character_details.id }).from(character_details).all()).length;
    if (count === 0) {
        return new ApiResponse(StatusCode.NOT_FOUND, 'No characters found.');
    }

    if (body.Filter.trim().length === 0) {
        switch (body.Order) {
            case 'alph_asc':
                characters = await drizzleDb
                    .select()
                    .from(character_details)
                    .orderBy(asc(character_details.file_name))
                    .offset(body.Count * (body.Page - 1))
                    .limit(body.Count);
                break;
            case 'alph_desc':
                characters = await drizzleDb
                    .select()
                    .from(character_details)
                    .orderBy(desc(character_details.file_name))
                    .offset(body.Count * (body.Page - 1))
                    .limit(body.Count);
                break;
            case 'time_asc':
                characters = await drizzleDb
                    .select()
                    .from(character_details)
                    .orderBy(asc(character_details.timestamp))
                    .offset(body.Count * (body.Page - 1))
                    .limit(body.Count);
                break;
            case 'time_desc':
                characters = await drizzleDb
                    .select()
                    .from(character_details)
                    .orderBy(desc(character_details.timestamp))
                    .offset(body.Count * (body.Page - 1))
                    .limit(body.Count);
                break;
            case 'id_asc':
                characters = await drizzleDb
                    .select()
                    .from(character_details)
                    .orderBy(asc(character_details.id))
                    .offset(body.Count * (body.Page - 1))
                    .limit(body.Count);
                break;
            case 'id_desc':
                characters = await drizzleDb
                    .select()
                    .from(character_details)
                    .orderBy(desc(character_details.id))
                    .offset(body.Count * (body.Page - 1))
                    .limit(body.Count);
                break;
        }
    } else {
        switch (body.Order) {
            case 'alph_asc':
                characters = await drizzleDb
                    .select()
                    .from(character_details)
                    .offset(body.Count * (body.Page - 1))
                    .limit(body.Count)
                    .orderBy(asc(character_details.file_name))
                    .where(like(character_details.file_name, '%' + body.Filter + '%'));
                break;
            case 'alph_desc':
                characters = await drizzleDb
                    .select()
                    .from(character_details)
                    .orderBy(desc(character_details.file_name))
                    .offset(body.Count * (body.Page - 1))
                    .limit(body.Count)
                    .where(like(character_details.file_name, '%' + body.Filter + '%'));
                break;
            case 'time_asc':
                characters = await drizzleDb
                    .select()
                    .from(character_details)
                    .orderBy(asc(character_details.timestamp))
                    .offset(body.Count * (body.Page - 1))
                    .limit(body.Count)
                    .where(like(character_details.file_name, '%' + body.Filter + '%'));
                break;
            case 'time_desc':
                characters = await drizzleDb
                    .select()
                    .from(character_details)
                    .orderBy(desc(character_details.timestamp))
                    .offset(body.Count * (body.Page - 1))
                    .limit(body.Count)
                    .where(like(character_details.file_name, '%' + body.Filter + '%'));
                break;
            case 'id_asc':
                characters = await drizzleDb
                    .select()
                    .from(character_details)
                    .orderBy(asc(character_details.id))
                    .offset(body.Count * (body.Page - 1))
                    .limit(body.Count)
                    .where(like(character_details.file_name, '%' + body.Filter + '%'));
                break;
            case 'id_desc':
                characters = await drizzleDb
                    .select()
                    .from(character_details)
                    .orderBy(desc(character_details.id))
                    .offset(body.Count * (body.Page - 1))
                    .limit(body.Count)
                    .where(like(character_details.file_name, '%' + body.Filter + '%'));
                break;
        }
    }

    if (characters.length === 0) {
        return new ApiResponse(StatusCode.NOT_FOUND, 'No characters found.');
    }

    return new ApiResponse(StatusCode.OK, 'Character retrieved.', characters);
});
