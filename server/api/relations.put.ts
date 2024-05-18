import { createDatabase } from 'db0';
import sqlite from 'db0/connectors/better-sqlite3';
import { drizzle } from 'db0/integrations/drizzle/index';
import { distance } from 'fastest-levenshtein';
import _ from 'lodash';
import Piscina from 'piscina';
import ApiResponse from '~/models/ApiResponse';
import StatusCode from '~/models/enums/StatusCode';
import { character_definitions, character_details, character_relations } from '~/utils/drizzle/schema';

// noinspection JSUnusedGlobalSymbols
export default defineEventHandler(async (event) => {
    const db = createDatabase(sqlite({ name: 'CharaManager' }));
    const drizzleDb = drizzle(db);

    const startTime = performance.now();

    let newRelations: any[] = [];

    const relations = await drizzleDb.select().from(character_relations).all();
    for (const relation of relations) {
        newRelations.push({ current_id: relation.current_id, old_id: relation.old_id });
    }

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
                    if (parentList.has(detail2.id)) {
                        _.remove(newRelations, function (x) {
                            return x.current_id === detail2.id;
                        });

                        newRelations.push({ current_id: detail1.id, old_id: detail2.id });
                        childList.add(detail2.id);

                        relations
                            .filter((x) => x.current_id === detail2.id)
                            .forEach((x) => {
                                newRelations.push({ current_id: detail1.id, old_id: x.old_id });
                            });

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

    const pool = new Piscina({
        filename: import.meta.dev ? new URL('./../../public/scripts/MatchByDistance.mjs', import.meta.url).href : new URL('./../public/scripts/MatchByDistance.cjs', import.meta.url).href,
        maxQueue: 'auto',
    });

    const promises = definitions.map(async (definition1) => {
        for (const definition2 of definitions) {
            if (definition1.id === definition2.id || definition2.id > definition1.id) {
                continue;
            }

            if (relations.length > 0) {
                if (relations.find((pair: any) => pair.current_id === definition1.id && pair.old_id === definition2.id) !== undefined) {
                    continue;
                }
            }

            const result = await pool.run({ definition1: definition1, definition2: definition2, relations: relations, parentList: parentList, childList: childList });

            if (result && result.relations.length > 0) {
                if (result.childId) {
                    _.remove(newRelations, function (x) {
                        return x.current_id === result.childId;
                    });
                }
                newRelations = newRelations.concat(result.relations);
                childList.add(result.childId);
            }
        }
    });

    Promise.all(promises).then(async () => {
        for (const newRelation of newRelations) {
            await drizzleDb.insert(character_relations).values({ current_id: newRelation.current_id, old_id: newRelation.old_id }).onConflictDoNothing();
        }

        const endTime = performance.now();

        console.log(`Done in ${Math.floor((endTime - startTime / 1000) % 60)} seconds.`);
        const total = (await drizzleDb.select().from(character_relations).all()).length;

        return new ApiResponse(StatusCode.OK, `Added ${newRelations.length} relations. Total count of relations: ${total}.`);
    });
});
