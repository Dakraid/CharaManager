import { relations } from "drizzle-orm/relations";
import { character_details, character_definitions, character_images } from "./schema";

export const character_definitionsRelations = relations(character_definitions, ({one}) => ({
	character_card: one(character_details, {
		fields: [character_definitions.id],
		references: [character_details.id]
	}),
}));

export const character_cardsRelations = relations(character_details, ({many}) => ({
	character_definitions: many(character_definitions),
	character_images: many(character_images),
}));

export const character_imagesRelations = relations(character_images, ({one}) => ({
	character_card: one(character_details, {
		fields: [character_images.id],
		references: [character_details.id]
	}),
}));
