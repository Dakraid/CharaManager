import { createDatabase } from 'db0';
import sqlite from 'db0/connectors/better-sqlite3';
import { status_success_database_connected } from '~/models/StatusResponses';

export default defineEventHandler(async (_) => {
    const db = createDatabase(sqlite({ name: 'CharaManager' }));
    await db.sql`CREATE TABLE IF NOT EXISTS character_cards (
		id integer primary key autoincrement,
		hash text,
		full_name text,
		file_name text,
		timestamp integer,
		formatted_timestamp text,
		image_content text
	  )`;

    await db.sql`CREATE TABLE IF NOT EXISTS character_definition (
        characterId integer not null,
		id integer primary key autoincrement,
		hash text,
        name text,
        description text,
        personality text,
        scenario text,
        first_mes text,
        mes_example text,
        creator_notes text,
        system_prompt text,
        alternate_greetings text,
        tags text,
        creator text,
        character_version text,
        FOREIGN KEY(characterId) REFERENCES character_cards(id)
	  )`;

    return status_success_database_connected;
});
