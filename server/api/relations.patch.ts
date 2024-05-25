import { createDatabase } from 'db0';
import sqlite from 'db0/connectors/better-sqlite3';
import { drizzle } from 'db0/integrations/drizzle/index';
import { eq } from 'drizzle-orm';
import _ from 'lodash';
import Piscina from 'piscina';
import ApiResponse from '~/models/ApiResponse';
import type PatchRelationsRequest from '~/models/PatchRelationsRequest';
import StatusCode from '~/models/enums/StatusCode';
import { character_definitions, character_details, character_relations } from '~/utils/drizzle/schema';

// noinspection JSUnusedGlobalSymbols
export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event);

    const apiKey = event.headers.get('x-api-key');
    if (!apiKey || apiKey !== config.apiKey) {
        return new ApiResponse(StatusCode.FORBIDDEN, 'Missing or invalid API key given.');
    }

    const body = await readBody<PatchRelationsRequest>(event);
    if (!body) {
        return new ApiResponse(StatusCode.BAD_REQUEST, 'The request body is malformed or corrupted.');
    }

    const db = createDatabase(sqlite({ name: 'CharaManager' }));
    const drizzleDb = drizzle(db);

    let relations: any[] = [];

    const existingRelations = await drizzleDb.select().from(character_relations).all();
    for (const relation of existingRelations) {
        relations.push({ current_id: relation.current_id, old_id: relation.old_id });
    }

    await drizzleDb.delete(character_relations);

    const parentList = new Set<number>(existingRelations.map((x) => x.current_id));
    const childList = new Set<number>(existingRelations.map((x) => x.old_id));

    const itemDetail = (await drizzleDb.select().from(character_details).where(eq(character_details.id, body.Id)))[0];
    const details = await drizzleDb.select().from(character_details).all();
    details.sort((a, b) => b.id - a.id);

    event.context.logger.info('Matching by name...');
    for (const detail of details) {
        if (itemDetail.id === detail.id || detail.id > itemDetail.id) {
            continue;
        }

        if (existingRelations.length > 0) {
            if (existingRelations.find((pair) => pair.current_id === itemDetail.id && pair.old_id === detail.id) !== undefined) {
                continue;
            }
        }

        if (itemDetail.file_name.startsWith('main_') && detail.file_name.startsWith('main_')) {
            const name1 = itemDetail.file_name.replace(/v2.*/g, 'v2.png');
            const name2 = detail.file_name.replace(/v2.*/g, 'v2.png');

            if (name1 === name2) {
                if (parentList.has(detail.id)) {
                    _.remove(relations, function (x) {
                        return x.current_id === detail.id;
                    });

                    relations.push({ current_id: itemDetail.id, old_id: detail.id });
                    childList.add(detail.id);

                    existingRelations
                        .filter((x) => x.current_id === detail.id)
                        .forEach((x) => {
                            relations.push({ current_id: itemDetail.id, old_id: x.old_id });
                        });

                    continue;
                }

                if (!childList.has(itemDetail.id)) {
                    try {
                        relations.push({ current_id: itemDetail.id, old_id: detail.id });
                        childList.add(detail.id);
                    } catch {
                        // Ignore
                    }
                }
            }
        }
    }

    const itemDefinition = (await drizzleDb.select().from(character_definitions).where(eq(character_definitions.id, body.Id)))[0];
    const definitions = await drizzleDb.select().from(character_definitions).all();
    definitions.sort((a, b) => b.id - a.id);

    event.context.logger.info('Matching by string distance...');
    const pool = new Piscina({
        filename: import.meta.dev ? new URL('./../../public/scripts/MatchByDistance.mjs', import.meta.url).href : new URL('./../public/scripts/MatchByDistance.cjs', import.meta.url).href,
    });

    const promises = definitions.map(async (definition) => {
        if (itemDefinition.id === definition.id || definition.id > itemDefinition.id) {
            return;
        }

        if (existingRelations.length > 0) {
            if (existingRelations.find((pair: any) => pair.current_id === itemDefinition.id && pair.old_id === definition.id) !== undefined) {
                return;
            }
        }

        const result = await pool.run({ definition1: itemDefinition, definition2: definition, relations: existingRelations, parentList: parentList, childList: childList });

        if (result && result.relations.length > 0) {
            if (result.childId) {
                _.remove(relations, function (x) {
                    return x.current_id === result.childId;
                });
            }
            relations = relations.concat(result.relations);
            childList.add(result.childId);
        }
    });

    Promise.all(promises).then(async () => {
        await pool.close();
        for (const newRelation of relations) {
            await drizzleDb.insert(character_relations).values({ current_id: newRelation.current_id, old_id: newRelation.old_id }).onConflictDoNothing();
        }
        event.context.logger.info('Done');
    });
});
