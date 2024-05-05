-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `character_cards` (
	`id` integer PRIMARY KEY,
	`hash` text,
	`full_name` text,
	`file_name` text,
	`timestamp` integer,
	`formatted_timestamp` text,
	`image_content` text
);
--> statement-breakpoint
CREATE TABLE `character_definition` (
	`characterId` integer NOT NULL,
	`id` integer PRIMARY KEY,
	`hash` text,
	`name` text,
	`description` text,
	`personality` text,
	`scenario` text,
	`first_mes` text,
	`mes_example` text,
	`creator_notes` text,
	`system_prompt` text,
	`alternate_greetings` text,
	`tags` text,
	`creator` text,
	`character_version` text,
	FOREIGN KEY (`characterId`) REFERENCES `character_cards`(`id`) ON UPDATE no action ON DELETE no action
);

*/