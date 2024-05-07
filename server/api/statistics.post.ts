// noinspection ES6PreferShortImport

import { createDatabase } from 'db0';
import sqlite from 'db0/connectors/better-sqlite3';
import { drizzle } from 'db0/integrations/drizzle/index';
import { characterCards, characterDefinitions } from '~/utils/drizzle/schema';
import {Author, CharDate, Statistics} from '~/models/Statistics';
import _ from "lodash";
import dayjs from "dayjs";

export default defineEventHandler(async (event) => {
    const db = createDatabase(sqlite({ name: 'CharaManager' }));

    const drizzleDb = drizzle(db);
    const characters = await drizzleDb.select().from(characterCards).all();
    const characterDefsRaw = await drizzleDb.select().from(characterDefinitions).all();
    const characterDefs = characterDefsRaw.map((def) => JSON.parse(def.json).data);

    const authorsGrouped = _.groupBy(characterDefs, 'creator');
    let authors: Author[] = [];
    _.forEach(authorsGrouped, function(value, key) {
        if (key.trim().length === 0) {
            authors.push(new Author("Undefined", value.length));
            return;
        }
        if (key.includes('\r\n')) {
            authors.push(new Author(key.split('\r\n')[0], value.length));
            return;
        }
        authors.push(new Author(key, value.length));
    });

    const datesGrouped = _.groupBy(characters, char => dayjs(char.timestamp).format('DD/MM/YYYY'));
    let dates: CharDate[] = [];
    _.forEach(datesGrouped, function(value, key) {
        dates.push(new CharDate(key, value.length));
    });

    const statistics: Statistics = {
        charCount: characters.length,
        charAuthors: authors,
        charDates: dates
    };

    return statistics;
});
