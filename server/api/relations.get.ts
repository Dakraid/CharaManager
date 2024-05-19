import { createDatabase } from 'db0';
import sqlite from 'db0/connectors/better-sqlite3';
import { drizzle } from 'db0/integrations/drizzle/index';
import _ from 'lodash';
import ApiResponse from '~/models/ApiResponse';
import CharacterRelations from '~/models/CharacterRelations';
import { Author } from '~/models/OLD/Statistics';
import StatusCode from '~/models/enums/StatusCode';
import { character_relations } from '~/utils/drizzle/schema';

// noinspection JSUnusedGlobalSymbols
export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event);

    const apiKey = event.headers.get('x-api-key');
    if (!apiKey || apiKey !== config.public.apiKey) {
        return new ApiResponse(StatusCode.FORBIDDEN, 'Missing or invalid API key given.');
    }

    const db = createDatabase(sqlite({ name: 'CharaManager' }));
    const drizzleDb = drizzle(db);

    const relations = await drizzleDb.select().from(character_relations).all();

    const groupedRelations = _.groupBy(relations, 'current_id');

    const characterRelations: CharacterRelations[] = [];

    _.forEach(groupedRelations, function (value, key) {
        characterRelations.push(
            new CharacterRelations(
                Number(key),
                value.map((x) => x.old_id)
            )
        );
    });

    return new ApiResponse(StatusCode.OK, `Retrieved relations.`, characterRelations);
});
