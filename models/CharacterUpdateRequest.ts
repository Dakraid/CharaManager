import type { Character } from '~/models/Character';

export interface CharacterUpdateRequest {
    character: Character;
    newContent: string;
}
