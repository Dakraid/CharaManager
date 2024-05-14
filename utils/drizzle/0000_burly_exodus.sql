-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `character_definitions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`hash` text NOT NULL,
	`json` text NOT NULL,
	FOREIGN KEY (`id`) REFERENCES `character_details`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `character_images` (
	`id` integer PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	FOREIGN KEY (`id`) REFERENCES `character_details`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `character_details` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`hash` text NOT NULL,
	`full_name` text NOT NULL,
	`file_name` text NOT NULL,
	`timestamp` integer NOT NULL,
	`formatted_timestamp` text NOT NULL,
	`rating` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `character_relations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`current_id` integer NOT NULL,
	`old_id` integer NOT NULL,
	FOREIGN KEY (`old_id`) REFERENCES `character_details`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`current_id`) REFERENCES `character_details`(`id`) ON UPDATE no action ON DELETE no action
);

*/