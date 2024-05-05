import { sqliteTable, AnySQLiteColumn, integer, text, foreignKey } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const characterCards = sqliteTable('character_cards', {
    id: integer('id').primaryKey(),
    hash: text('hash'),
    fullName: text('full_name'),
    fileName: text('file_name'),
    timestamp: integer('timestamp'),
    formattedTimestamp: text('formatted_timestamp'),
    imageContent: text('image_content'),
});

export const characterDefinition = sqliteTable('character_definition', {
    characterId: integer('characterId')
        .notNull()
        .references(() => characterCards.id),
    id: integer('id').primaryKey(),
    hash: text('hash'),
    name: text('name'),
    description: text('description'),
    personality: text('personality'),
    scenario: text('scenario'),
    firstMes: text('first_mes'),
    mesExample: text('mes_example'),
    creatorNotes: text('creator_notes'),
    systemPrompt: text('system_prompt'),
    alternateGreetings: text('alternate_greetings'),
    tags: text('tags'),
    creator: text('creator'),
    characterVersion: text('character_version'),
});
