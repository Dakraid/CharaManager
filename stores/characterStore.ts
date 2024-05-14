import type { CharacterDetails } from '~/models/CharacterDetails';
import ApiResponse from "~/models/ApiResponse";
import type GetCharactersRequest from "~/models/GetCharactersRequest";
import StatusCode from "~/models/enums/StatusCode";
import DeleteCharacterRequest from "~/models/DeleteCharacterRequest";

async function getCharacterCount() {
    const response = await $fetch<ApiResponse>('/api/count', {
        method: 'GET',
    });

    return response.Content ?? 0;
}

async function getCharacters(options: GetCharactersRequest) {
    const response = await $fetch<ApiResponse>('/api/characters', {
        method: 'POST',
        body: options,
    });

    const characters: CharacterDetails[] = [];
    if (response.Status === StatusCode.OK) {
        for (const character of response.Content) {
            characters.push({
                id: character.id,
                hash: character.hash,
                full_name: character.full_name,
                file_name: character.file_name,
                timestamp: character.timestamp,
                formatted_timestamp: character.formatted_timestamp,
                rating: character.rating,
            });
        }
    }

    return characters;
}

async function getCharacter(id: number) {
    return await $fetch<ApiResponse>('/api/character', {
        method: 'GET',
        query: { id: id },
    });
}

async function deleteCharacter(options: DeleteCharacterRequest) {
    return await $fetch<ApiResponse>('/api/characters', {
        method: 'DELETE',
        body: options,
    });
}

export const useCharacterStore = defineStore('characters', {
    state: () => {
        return {
            characterList: [] as CharacterDetails[],
            characterCount: 0,
        };
    },
    getters: {},
    actions: {
        async updateCharacterCount() {
            this.characterCount = await getCharacterCount();
        },
        async getCharacterById(id: number) {
            const result= await getCharacter(id);
            if (result.Status === StatusCode.OK) {
                return result.Content as CharacterDetails;
            } else {
                return undefined;
            }
        },
        async getCharacters() {
            const applicationStore = useApplicationStore();
            applicationStore.processing = true;
            this.characterCount = await getCharacterCount();
            this.characterList = await getCharacters(applicationStore.queryOptions);
            applicationStore.processing = false;
        },
        async deleteCharacter(id: number) {
            const applicationStore = useApplicationStore();
            applicationStore.processing = true;
            const response = await deleteCharacter(new DeleteCharacterRequest(id));
            this.getCharacters();
            applicationStore.processing = false;
            return response;
        },
    },
});
