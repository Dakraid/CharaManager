import { relations } from "drizzle-orm/relations";
import { character_details, character_definitions, character_relations, character_images } from "./schema";

export const character_definitionsRelations = relations(character_definitions, ({one}) => ({
	character_detail: one(character_details, {
		fields: [character_definitions.id],
		references: [character_details.id]
	}),
}));

export const character_detailsRelations = relations(character_details, ({many}) => ({
	character_definitions: many(character_definitions),
	character_relations_old_id: many(character_relations, {
		relationName: "character_relations_old_id_character_details_id"
	}),
	character_relations_current_id: many(character_relations, {
		relationName: "character_relations_current_id_character_details_id"
	}),
	character_images: many(character_images),
}));

export const character_relationsRelations = relations(character_relations, ({one}) => ({
	character_detail_old_id: one(character_details, {
		fields: [character_relations.old_id],
		references: [character_details.id],
		relationName: "character_relations_old_id_character_details_id"
	}),
	character_detail_current_id: one(character_details, {
		fields: [character_relations.current_id],
		references: [character_details.id],
		relationName: "character_relations_current_id_character_details_id"
	}),
}));

export const character_imagesRelations = relations(character_images, ({one}) => ({
	character_detail: one(character_details, {
		fields: [character_images.id],
		references: [character_details.id]
	}),
}));