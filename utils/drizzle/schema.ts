// noinspection ES6UnusedImports

import { sqliteTable, integer, text, foreignKey } from "drizzle-orm/sqlite-core"
import type { AnySQLiteColumn } from "drizzle-orm/sqlite-core"
import { sql } from "drizzle-orm"

export const characterCards = sqliteTable("character_cards", {
	id: integer("id").primaryKey({ autoIncrement: true }).unique(),
	hash: text("hash").notNull(),
	fullName: text("full_name").notNull(),
	fileName: text("file_name").notNull(),
	timestamp: integer("timestamp").notNull(),
	formattedTimestamp: text("formatted_timestamp").notNull(),
	imageContent: text("image_content").notNull(),
});

export const characterDefinitions = sqliteTable("character_definitions", {
	id: integer("id").references(() => characterCards.id).unique(),
	hash: text("hash").notNull(),
	json: text("json").notNull(),
});
