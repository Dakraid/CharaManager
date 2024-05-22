import dayjs from 'dayjs';
import { createDatabase } from 'db0';
import sqlite from 'db0/connectors/better-sqlite3';
import { drizzle } from 'db0/integrations/drizzle/index';
import _ from 'lodash';
import ApiResponse from '~/models/ApiResponse';
import type { Statistics } from '~/models/OLD/Statistics';
import { Author, CharDate, CharTokens } from '~/models/OLD/Statistics';
import StatusCode from '~/models/enums/StatusCode';
import { character_definitions, character_details } from '~/utils/drizzle/schema';

// noinspection JSUnusedGlobalSymbols
export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event);

    const apiKey = event.headers.get('x-api-key');
    if (!apiKey || apiKey !== config.apiKey) {
        return new ApiResponse(StatusCode.FORBIDDEN, 'Missing or invalid API key given.');
    }

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

    const tokens: CharTokens[] = [];
    characterDefs.forEach((char) => {
        tokens.push(new CharTokens(char.name, char.description.length));
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
        charTokens: tokens,
    };

    return statistics;
});
