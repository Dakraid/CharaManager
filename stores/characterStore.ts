import type { CharactersGetRequest } from '~/models/CharactersGetRequest';
import type { StatusResponse } from '~/models/StatusResponse';
import type { Character } from '~/models/Character';
import type { CharactersDeleteRequest } from '~/models/CharactersDeleteRequest';

async function getCharacterCount() {
    const response: StatusResponse = await $fetch('/api/count', {
        method: 'GET',
    });

    return response.content ?? 0;
}

async function getCharacters(options: CharactersGetRequest) {
    const response: StatusResponse = await $fetch('/api/characters', {
        method: 'POST',
        body: options,
    });

    const characters: Character[] = [];
    if (response.status === 200) {
        if (response.content === undefined || response.content.length === 0) {
            return characters;
        }

        for (const character of response.content) {
            characters.push({
                id: character.id,
                hash: character.hash,
                full_name: character.full_name,
                file_name: character.file_name,
                timestamp: character.timestamp,
                formatted_timestamp: character.formatted_timestamp,
                image_content: character.image_content,
                rating: character.rating,
            });
        }
    }

    return characters;
}

async function getCharacter(id: number) {
    return await $fetch('/api/character', {
        method: 'POST',
        body: { id: id },
    });
}

async function deleteCharacter(options: CharactersDeleteRequest) {
    return await $fetch('/api/characters', {
        method: 'DELETE',
        body: options,
    });
}

export const useCharacterStore = defineStore('characters', {
    state: () => {
        return {
            characterList: [] as Character[],
            characterCount: 0,
        };
    },
    getters: {},
    actions: {
        async updateCharacterCount() {
            this.characterCount = await getCharacterCount();
        },
        async getCharacterById(id: number) {
            return (await getCharacter(id)) as Character;
        },
        async getCharacters() {
            const applicationStore = useApplicationStore();
            applicationStore.processing = true;
            this.characterCount = await getCharacterCount();
            this.characterList = await getCharacters(applicationStore.queryOptions);
            applicationStore.processing = false;
        },
        async deleteCharacter() {
            const applicationStore = useApplicationStore();
            applicationStore.processing = true;
            const response = await deleteCharacter(applicationStore.deleteOptions);
            await this.getCharacters();
            applicationStore.processing = false;
            return response;
        },
    },
});
