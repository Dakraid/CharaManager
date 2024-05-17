// noinspection ES6PreferShortImport

import { createDatabase } from 'db0';
import sqlite from 'db0/connectors/better-sqlite3';
import { drizzle } from 'db0/integrations/drizzle/index';
import {character_details, character_relations} from '~/utils/drizzle/schema';
import { eq } from 'drizzle-orm';
import type PatchDetailsRequest from '~/models/PatchDetailsRequest';
import ApiResponse from '~/models/ApiResponse';
import StatusCode from '~/models/enums/StatusCode';

// noinspection JSUnusedGlobalSymbols
export default defineEventHandler(async (event) => {
    const body = await readBody<PatchDetailsRequest>(event);
    if (!body) {
        return new ApiResponse(StatusCode.BAD_REQUEST, 'The request body is malformed or corrupted.');
    }

    const db = createDatabase(sqlite({ name: 'CharaManager' }));
    const drizzleDb = drizzle(db);

    try {
        const relations = await drizzleDb.select().from(character_relations).where(eq(character_relations.current_id, <number>body.Details.id));

        if (relations.length > 0) {
            for (const relation of relations) {
                await drizzleDb
                    .update(character_details)
                    .set({rating: body.Details.rating})
                    .where(eq(character_details.id, <number>relation.old_id));
            }
        }

        await drizzleDb
            .update(character_details)
            .set({rating: body.Details.rating})
            .where(eq(character_details.id, <number>body.Details.id));

        return new ApiResponse(StatusCode.OK, 'Updated character successfully.');
    } catch (err) {
        return new ApiResponse(StatusCode.INTERNAL_SERVER_ERROR, 'Failed to updated character.', err);
    }
});
