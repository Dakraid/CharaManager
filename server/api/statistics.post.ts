// noinspection ES6PreferShortImport

import { createDatabase } from 'db0';
import sqlite from 'db0/connectors/better-sqlite3';
import { drizzle } from 'db0/integrations/drizzle/index';
import { characterCards, characterDefinitions } from '~/utils/drizzle/schema';
import type { Statistics } from '~/models/Statistics';
import _ from "lodash";

export default defineEventHandler(async (event) => {
    const db = createDatabase(sqlite({ name: 'CharaManager' }));

    const drizzleDb = drizzle(db);
    const characters = await drizzleDb.select().from(characterCards).all();
    const characterDefsRaw = await drizzleDb.select().from(characterDefinitions).all();
    const characterDefs = characterDefsRaw.map((def) => JSON.parse(def.json).data);

    const authors = _.keys(_.groupBy(characterDefs, 'creator'));

    const statistics: Statistics = {
        characterCount: characters.length,
        authors: authors,
    };

    return statistics;
});
