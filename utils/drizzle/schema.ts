import { sqliteTable, foreignKey, integer, text } from "drizzle-orm/sqlite-core"
import type { AnySQLiteColumn } from "drizzle-orm/sqlite-core"
import { sql } from "drizzle-orm"

export const character_definitions = sqliteTable("character_definitions", {
	id: integer("id").primaryKey({ autoIncrement: true }).notNull().references(() => character_details.id),
	hash: text("hash").notNull(),
	json: text("json").notNull(),
});

export const character_details = sqliteTable("character_details", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	hash: text("hash").notNull(),
	full_name: text("full_name").notNull(),
	file_name: text("file_name").notNull(),
	timestamp: integer("timestamp").notNull(),
	formatted_timestamp: text("formatted_timestamp").notNull(),
	rating: integer("rating").default(0).notNull(),
});

export const character_relations = sqliteTable("character_relations", {
	id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
	current_id: integer("current_id").notNull().references(() => character_details.id),
	old_id: integer("old_id").notNull().references(() => character_details.id),
});

export const character_images = sqliteTable("character_images", {
	id: integer("id").primaryKey().notNull().references(() => character_details.id),
	content: text("content").notNull(),
	content_small: text("content_small"),
	hash: text("hash").notNull(),
});
