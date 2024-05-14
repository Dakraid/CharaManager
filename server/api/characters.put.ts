// noinspection ES6PreferShortImport

import * as Cards from 'character-card-utils';
import dayjs from 'dayjs';
import { createDatabase } from 'db0';
import sqlite from 'db0/connectors/better-sqlite3';
import { drizzle } from 'db0/integrations/drizzle/index';
import { like } from 'drizzle-orm';
import { createHash } from 'node:crypto';
import ApiResponse from '~/models/ApiResponse';
import { CharacterDetails } from '~/models/CharacterDetails';
import { status_success_characters_uploaded, status_success_characters_uploaded_withConflict } from '~/models/OLD/StatusResponses';
import PutImageRequest from '~/models/PutImageRequest';
import StatusCode from '~/models/enums/StatusCode';
import convertBase64PNGToString from '~/server/utils/convertBase64PNGToString';
import { character_details } from '~/utils/drizzle/schema';

// noinspection JSUnusedGlobalSymbols
export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    if (!body) {
        return new ApiResponse(StatusCode.BAD_REQUEST, 'The request body is malformed or corrupted.');
    }

    const db = createDatabase(sqlite({ name: 'CharaManager' }));
    const drizzleDb = drizzle(db);

    const fileConflicts: string[] = [];
    const errors: string[] = [];

    for (const file of body.files) {
        const hash = createHash('sha256').update(file.content).digest('hex');
        const matches = await drizzleDb.select().from(character_details).where(like(character_details.hash, hash));
        if (matches.length > 0) {
            fileConflicts.push(`File ${file.name} already exists.`);
            continue;
        }

        const timestamp = file.lastModified ? file.lastModified : dayjs().unix();
        const character = new CharacterDetails(hash, timestamp + '_' + file.name, file.name, timestamp, dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss'), 0);

        const content = JSON.parse(convertBase64PNGToString(file.content));
        if (!content.data) {
            const converted = Cards.v1ToV2(content);
            file.content = convertStringToBase64PNG(file.content, JSON.stringify(converted));
            console.log('Updated character from v1 to v2: ' + file.name);
        }

        let result: any;
        try {
            result = await drizzleDb.insert(character_details).values(character).returning({ id: character_details.id }).onConflictDoNothing();
        } catch (err) {
            errors.push(`Failed to insert character from file ${file.name}: ${err}`);
            continue;
        }

        const response = await $fetch<ApiResponse>('/api/image', {
            method: 'PUT',
            body: new PutImageRequest(result[0].id, file.content),
        });

        if (response.Status !== StatusCode.OK) {
            errors.push(`Failed to process image for file ${file.name}: ${response.Content}`);
        }
    }

    if (errors.length > 0) {
        return new ApiResponse(StatusCode.INTERNAL_SERVER_ERROR, 'Multiple errors occurred during upload, files might only be partially uploaded.', errors);
    }

    if (fileConflicts.length > 0) {
        return new ApiResponse(StatusCode.OK, 'Files have been uploaded, but some have been skipped due to already existing.', fileConflicts);
    }

    return new ApiResponse(StatusCode.OK, 'Files have been uploaded.');
});
