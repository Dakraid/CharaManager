// noinspection ES6PreferShortImport

import { createDatabase } from 'db0';
import sqlite from 'db0/connectors/better-sqlite3';
import { status_success_database_connected } from '~/models/StatusResponses';

export default defineEventHandler(async (_) => {
    const db = createDatabase(sqlite({ name: 'CharaManager' }));
    await db.sql`CREATE TABLE IF NOT EXISTS character_cards (
		id integer primary key autoincrement UNIQUE,
		hash text NOT NULL,
		full_name text NOT NULL,
		file_name text NOT NULL,
		timestamp integer NOT NULL,
		formatted_timestamp text NOT NULL,
		image_content text NOT NULL
	  )`;

    await db.sql`CREATE TABLE IF NOT EXISTS character_definitions (
        id integer primary key NOT NULL UNIQUE,
		hash text NOT NULL,
        json text NOT NULL,
        FOREIGN KEY(id) REFERENCES character_cards(id)
	  )`;

    return status_success_database_connected;
});
