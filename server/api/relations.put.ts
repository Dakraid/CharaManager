// noinspection ES6PreferShortImport

import { createDatabase } from 'db0';
import sqlite from 'db0/connectors/better-sqlite3';
import { drizzle } from 'db0/integrations/drizzle/index';
import ApiResponse from '~/models/ApiResponse';
import StatusCode from '~/models/enums/StatusCode';
import { character_definitions, character_details, character_relations } from '~/utils/drizzle/schema';
import { distance } from 'fastest-levenshtein';
import _ from "lodash";

async function MatchByDistance(definitions: any, relations: any, parentList: Set<number>, childList: Set<number>, i: number, j: number) {
    const json1 = JSON.parse(definitions[i].json);
    const json2 = JSON.parse(definitions[j].json);

    const text1 = json1.data.description + json1.data.first_mes;
    const text2 = json2.data.description + json2.data.first_mes;

    const measurement = distance(text1, text2);
    const maxLength = Math.max(text1.length, text2.length);
    const normalizedDistance = measurement / maxLength;
    const similarity = 1 - normalizedDistance;

    if (similarity >= 0.85) {
        const newRelations: any[] = [];
        if (parentList.has(definitions[j].id)) {
            newRelations.push({ current_id: definitions[i].id, old_id: definitions[j].id });
            childList.add(definitions[j].id);

            relations.filter((x: any) => x.current_id === definitions[j].id).forEach((x: any) => {
                newRelations.push({ current_id: definitions[i].id, old_id: x.old_id });
            })

            return {relations: newRelations, childId: definitions[j].id};
        }

        if (!childList.has(definitions[i].id)) {
            newRelations.push({ current_id: definitions[i].id, old_id: definitions[j].id });
            return {relations: newRelations};
        }
    }
}

async function compareDefinitions(definitions: any, relations: any, details: any, parentList: Set<number>, childList: Set<number>) {
    let newRelations: any[] = [];
    for (let i = 0; i < definitions.length; i++) {
        for (let j = 0; j < definitions.length; j++) {
            if (definitions[i].id === definitions[j].id || definitions[j].id > definitions[i].id) {
                continue;
            }

            if (relations.length > 0) {
                if (relations.find((pair: any) => pair.current_id === definitions[i].id && pair.old_id === definitions[j].id) !== undefined) {
                    continue;
                }
            }

            // const name1 = details.find((x: any) => x.id === definitions[i].id)?.file_name.replace(/card.*/g, 'card.png');
            // const name2 = details.find((x: any) => x.id === definitions[j].id)?.file_name.replace(/card.*/g, 'card.png');

            const match = await MatchByDistance(definitions, relations, parentList, childList, i, j);

            if (match && match.relations.length > 0) {
                if (match.childId) {
                    _.remove(newRelations, function(x) {
                        return x.current_id === match.childId;
                    });
                }
                newRelations = newRelations.concat(match.relations)
                childList.add(match.childId);
            }
        }
    }
    return newRelations;
}

// noinspection JSUnusedGlobalSymbols
export default defineEventHandler(async (event) => {
    const db = createDatabase(sqlite({ name: 'CharaManager' }));
    const drizzleDb = drizzle(db);

    const startTime = performance.now()

    await drizzleDb.delete(character_relations);
    let newRelations: any[] = [];

    const relations = await drizzleDb.select().from(character_relations).all();
    for (const relation of relations) {
        newRelations.push({ current_id: relation.current_id, old_id: relation.old_id });
    }

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
                    if (parentList.has(detail2.id)) {
                        _.remove(newRelations, function(x) {
                            return x.current_id === detail2.id;
                        });

                        newRelations.push({ current_id: detail1.id, old_id: detail2.id });
                        childList.add(detail2.id);

                        relations.filter(x => x.current_id === detail2.id).forEach((x) => {
                            newRelations.push({ current_id: detail1.id, old_id: x.old_id });
                        })

                        continue;
                    }

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
    const defRelations = await compareDefinitions(definitions, relations, details, parentList, childList);
    if (defRelations && defRelations.length > 0) {
        newRelations = newRelations.concat(defRelations);
    }
    const endTime = performance.now();

    for (const newRelation of newRelations) {
        await drizzleDb.insert(character_relations).values({ current_id: newRelation.current_id, old_id: newRelation.old_id }).onConflictDoNothing();
    }

    console.log(`Done in ${endTime - startTime} milliseconds.`);
    const total = (await drizzleDb.select().from(character_relations).all()).length;

    return new ApiResponse(StatusCode.OK, `Added ${newRelations.length} relations. Total count of relations: ${total}.`);
});
