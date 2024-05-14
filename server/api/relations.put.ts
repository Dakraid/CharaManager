// noinspection ES6PreferShortImport

import { createDatabase } from 'db0';
import sqlite from 'db0/connectors/better-sqlite3';
import { drizzle } from 'db0/integrations/drizzle/index';
import { distance } from 'fastest-levenshtein';
import ApiResponse from '~/models/ApiResponse';
import StatusCode from '~/models/enums/StatusCode';
import { character_definitions, character_details, character_relations } from '~/utils/drizzle/schema';

// noinspection JSUnusedGlobalSymbols
export default defineEventHandler(async (event) => {
    const db = createDatabase(sqlite({ name: 'CharaManager' }));
    const drizzleDb = drizzle(db);

    let added = 0;
    let counter = 0;

    const relations = await drizzleDb.select().from(character_relations).all();

    const childList: number[] = relations.map((x) => x.old_id);

    const details = await drizzleDb.select().from(character_details).all();
    details.sort((a, b) => b.id - a.id);

    console.log('Matching by name...');
    for (const detail1 of details) {
        for (const detail2 of details) {
            counter++;

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

                if (name1 === name2 && childList.indexOf(detail1.id) === -1) {
                    try {
                        await drizzleDb.insert(character_relations).values({ current_id: detail1.id, old_id: detail2.id }).onConflictDoNothing();
                        childList.push(detail2.id);
                        added++;
                    } catch {
                        // Ignore
                    }
                }
            }
        }
    }

    counter = 0;
    const definitions = await drizzleDb.select().from(character_definitions).all();
    definitions.sort((a, b) => b.id - a.id);

    console.log('Matching by string distance...');
    for (const definition1 of definitions) {
        for (const definition2 of definitions) {
            counter++;

            if (definition1.id === definition2.id || definition2.id > definition1.id) {
                continue;
            }

            if (relations.length > 0) {
                if (relations.find((pair) => pair.current_id === definition1.id && pair.old_id === definition2.id) !== undefined) {
                    continue;
                }
            }

            const json1 = JSON.parse(definition1.json);
            const json2 = JSON.parse(definition2.json);

            const text1 = json1.data.description + json1.data.first_mes;
            const text2 = json2.data.description + json2.data.first_mes;

            const measurement = distance(text1, text2);
            const maxLength = Math.max(text1.length, text2.length);
            const normalizedDistance = measurement / maxLength;
            const similarity = 1 - normalizedDistance;

            if (similarity >= 0.98 && childList.indexOf(definition1.id) === -1) {
                try {
                    await drizzleDb.insert(character_relations).values({ current_id: definition1.id, old_id: definition2.id }).onConflictDoNothing();
                    childList.push(definition2.id);
                    added++;
                } catch {
                    // Ignore
                }
            }
        }
    }

    console.log(`Done.`);
    const total = (await drizzleDb.select().from(character_relations).all()).length;

    return new ApiResponse(StatusCode.OK, `Added ${added} relations. Total count of relations: ${total}.`);
});
