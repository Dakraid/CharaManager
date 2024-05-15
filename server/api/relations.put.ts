// noinspection ES6PreferShortImport

import { createDatabase } from 'db0';
import sqlite from 'db0/connectors/better-sqlite3';
import { drizzle } from 'db0/integrations/drizzle/index';
import ApiResponse from '~/models/ApiResponse';
import StatusCode from '~/models/enums/StatusCode';
import { character_definitions, character_details, character_relations } from '~/utils/drizzle/schema';
import {distance} from "fastest-levenshtein";

// noinspection JSUnusedGlobalSymbols
export default defineEventHandler(async (event) => {
    const db = createDatabase(sqlite({ name: 'CharaManager' }));
    const drizzleDb = drizzle(db);

    const newRelations: any[] = [];

    const relations = await drizzleDb.select().from(character_relations).all();
    await drizzleDb.delete(character_relations);

    const parentList = new Set<number>(relations.map((x) => x.current_id));
    const childList = new Set<number>(relations.map((x) => x.old_id));

    const details = await drizzleDb.select().from(character_details).all();
    details.sort((a, b) => b.id - a.id);

    console.log('Matching by name...');
    for (const detail1 of details) {
        for (const detail2 of details) {
            if (detail1.id === detail2.id || detail2.id > detail1.id) {
                continue;
            }

            if (relations.length > 0) {
                if (relations.find((pair) => pair.current_id === detail1.id && pair.old_id === detail2.id) !== undefined) {
                    continue;
                }
            }

            if (detail1.file_name.startsWith('main_') && detail2.file_name.startsWith('main_')) {
                const name1 = detail1.file_name.replace(/v2.*/g, 'v2.png');
                const name2 = detail2.file_name.replace(/v2.*/g, 'v2.png');

                if (name1 === name2) {
                    if (!childList.has(detail1.id)) {
                        try {
                            newRelations.push({ current_id: detail1.id, old_id: detail2.id });
                            childList.add(detail2.id);
                        } catch {
                            // Ignore
                        }
                    }
                }
            }
        }
    }

    const definitions = await drizzleDb.select().from(character_definitions).all();
    definitions.sort((a, b) => b.id - a.id);

    console.log('Matching by string distance...');
    for (let i = 0; i < definitions.length; i++) {
        for (let j = 0; j < definitions.length; j++) {
            if (definitions[i].id === definitions[j].id || definitions[j].id > definitions[i].id) {
                continue;
            }

            if (relations.length > 0) {
                if (relations.find((pair) => pair.current_id === definitions[i].id && pair.old_id === definitions[j].id) !== undefined) {
                    continue;
                }
            }

            const json1 = JSON.parse(definitions[i].json);
            const json2 = JSON.parse(definitions[j].json);

            const text1 = json1.data.description + json1.data.first_mes;
            const text2 = json2.data.description + json2.data.first_mes;

            const measurement = distance(text1, text2);
            const maxLength = Math.max(text1.length, text2.length);
            const normalizedDistance = measurement / maxLength;
            const similarity = 1 - normalizedDistance;

            if (similarity >= 0.6 && !childList.has(definitions[i].id)) {
                try {
                    newRelations.push({ current_id: definitions[i].id, old_id: definitions[j].id });
                    childList.add(definitions[j].id);
                } catch {
                    // Ignore
                }
            }
        }
    }

    for (const newRelation of newRelations) {
        await drizzleDb.insert(character_relations).values({ current_id: newRelation.current_id, old_id: newRelation.old_id }).onConflictDoNothing();
    }

    console.log(`Done.`);
    const total = (await drizzleDb.select().from(character_relations).all()).length;

    return new ApiResponse(StatusCode.OK, `Added ${newRelations.length} relations. Total count of relations: ${total}.`);
});
