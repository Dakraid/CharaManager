// noinspection ES6PreferShortImport

import dayjs from 'dayjs';
import { createDatabase } from 'db0';
import sqlite from 'db0/connectors/better-sqlite3';
import { drizzle } from 'db0/integrations/drizzle/index';
import _ from 'lodash';
import type { Statistics } from '~/models/OLD/Statistics';
import { Author, CharDate } from '~/models/OLD/Statistics';
import { character_definitions, character_details } from '~/utils/drizzle/schema';

// noinspection JSUnusedGlobalSymbols
export default defineEventHandler(async (event) => {
    const db = createDatabase(sqlite({ name: 'CharaManager' }));

    const drizzleDb = drizzle(db);
    const characters = await drizzleDb.select().from(character_details).all();
    const characterDefsRaw = await drizzleDb.select().from(character_definitions).all();
    const characterDefs = characterDefsRaw.map((def) => JSON.parse(def.json).data);

    const authorsGrouped = _.groupBy(characterDefs, 'creator');
    const authors: Author[] = [];
    _.forEach(authorsGrouped, function (value, key) {
        if (key.trim().length === 0) {
            authors.push(new Author('Undefined', value.length));
            return;
        }
        if (key.includes('\r\n')) {
            authors.push(new Author(key.split('\r\n')[0], value.length));
            return;
        }
        authors.push(new Author(key, value.length));
    });

    const datesGrouped = _.groupBy(characters, (char) => dayjs(char.timestamp).format('DD/MM/YYYY'));
    const dates: CharDate[] = [];
    _.forEach(datesGrouped, function (value, key) {
        dates.push(new CharDate(key, value.length));
    });

    const statistics: Statistics = {
        charCount: characters.length,
        charAuthors: authors,
        charDates: dates,
    };

    return statistics;
});
