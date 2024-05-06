-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `character_cards` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`hash` text NOT NULL,
	`full_name` text NOT NULL,
	`file_name` text NOT NULL,
	`timestamp` integer NOT NULL,
	`formatted_timestamp` text NOT NULL,
	`image_content` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `character_definition` (
	`id` integer,
	`hash` text NOT NULL,
	`json` text NOT NULL,
	FOREIGN KEY (`id`) REFERENCES `character_cards`(`id`) ON UPDATE no action ON DELETE no action
);

*/