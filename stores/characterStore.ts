import type ApiResponse from '~/models/ApiResponse';
import type { CharacterDetails } from '~/models/CharacterDetails';
import type CharacterImage from '~/models/CharacterImage';
import DeleteCharacterRequest from '~/models/DeleteCharacterRequest';
import type GetCharactersRequest from '~/models/GetCharactersRequest';
import GetImagesRequest from '~/models/GetImagesRequest';
import StatusCode from '~/models/enums/StatusCode';

async function _getCharacterCount() {
    const settingsStore = useSettingsStore();
    const response = await $fetch<ApiResponse>('/api/count', {
        method: 'GET',
        headers: { 'x-api-key': settingsStore.apiKey },
    });

    return response.Content ?? 0;
}

async function _getCharacterImages(ids: number[], reduce: boolean = true) {
    const settingsStore = useSettingsStore();

    const response = await $fetch<ApiResponse>('/api/images', {
        method: 'POST',
        headers: { 'x-api-key': settingsStore.apiKey },
        body: JSON.stringify(new GetImagesRequest(reduce, ids)),
    });

    const characterImages: CharacterImage[] = [];
    if (response.Status === StatusCode.OK) {
        for (const image of response.Content) {
            characterImages.push({
                id: image.id,
                content: image.content,
                content_small: image.content_small,
            });
        }
    }

    return characterImages;
}

async function _getCharacters(options: GetCharactersRequest) {
    const settingsStore = useSettingsStore();

    const response = await $fetch<ApiResponse>('/api/characters', {
        method: 'POST',
        headers: { 'x-api-key': settingsStore.apiKey },
        body: JSON.stringify(options),
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

async function _getCharacter(characters: CharacterDetails[], id: number) {
    const settingsStore = useSettingsStore();

    const index = characters.findIndex((item) => item.id === id);
    if (index !== -1) {
        return characters[index];
    }

    const response = await $fetch<ApiResponse>('/api/character', {
        method: 'GET',
        headers: { 'x-api-key': settingsStore.apiKey },
        query: { id: id },
    });

    if (response.Status === StatusCode.OK) {
        return response.Content;
    }

    return undefined;
}

async function _deleteCharacter(options: DeleteCharacterRequest) {
    const settingsStore = useSettingsStore();

    return await $fetch<ApiResponse>('/api/character', {
        method: 'DELETE',
        headers: { 'x-api-key': settingsStore.apiKey },
        body: JSON.stringify(options),
    });
}

export const useCharacterStore = defineStore('characters', {
    state: () => {
        return {
            characterImages: [] as CharacterImage[],
            characterList: [] as CharacterDetails[],
            characterCount: 0,
        };
    },
    getters: {},
    actions: {
        async getCharacterCount() {
            this.characterCount = await _getCharacterCount();
        },
        async getCharacterById(id: number) {
            return await _getCharacter(this.characterList, id);
        },
        async getCharacterImages(ids: number[]) {
            const applicationStore = useApplicationStore();
            await applicationStore.updateLoadingState(true);
            this.characterImages = await _getCharacterImages(ids);
            await applicationStore.updateLoadingState(false);
        },
        async getCharacters() {
            const applicationStore = useApplicationStore();
            await applicationStore.updateLoadingState(true);
            this.characterCount = await _getCharacterCount();
            this.characterList = await _getCharacters(applicationStore.characterQueryOptions);
            this.characterImages = await _getCharacterImages(this.characterList.map((char) => char.id as number));
            await applicationStore.updateLoadingState(false);
        },
        async deleteCharacter(id: number) {
            const applicationStore = useApplicationStore();
            await applicationStore.updateLoadingState(true);
            const response = await _deleteCharacter(new DeleteCharacterRequest(id));
            this.getCharacters();
            await applicationStore.updateLoadingState(false);
            return response;
        },
    },
});
