import type ApiResponse from '~/models/ApiResponse';
import type { CharacterDetails } from '~/models/CharacterDetails';
import type CharacterImage from '~/models/CharacterImage';
import DeleteCharacterRequest from '~/models/DeleteCharacterRequest';
import type GetCharactersRequest from '~/models/GetCharactersRequest';
import GetImagesRequest from '~/models/GetImagesRequest';
import StatusCode from '~/models/enums/StatusCode';

async function getCharacterCount() {
    const keyStore = useKeyStore();
    const response = await $fetch<ApiResponse>('/api/count', {
        method: 'GET',
        headers: { 'x-api-key': keyStore.apiKey },
    });

    return response.Content ?? 0;
}

async function getCharacterImages(ids: number[], reduce: boolean = true) {
    const keyStore = useKeyStore();

    const response = await $fetch<ApiResponse>('/api/images', {
        method: 'POST',
        headers: { 'x-api-key': keyStore.apiKey },
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

async function getCharacters(options: GetCharactersRequest) {
    const keyStore = useKeyStore();

    const response = await $fetch<ApiResponse>('/api/characters', {
        method: 'POST',
        headers: { 'x-api-key': keyStore.apiKey },
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

async function getCharacter(id: number) {
    const keyStore = useKeyStore();

    return await $fetch<ApiResponse>('/api/character', {
        method: 'GET',
        headers: { 'x-api-key': keyStore.apiKey },
        query: { id: id },
    });
}

async function deleteCharacter(options: DeleteCharacterRequest) {
    const keyStore = useKeyStore();

    return await $fetch<ApiResponse>('/api/character', {
        method: 'DELETE',
        headers: { 'x-api-key': keyStore.apiKey },
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
        async getCharacterById(id: number) {
            const result = await getCharacter(id);
            if (result.Status === StatusCode.OK) {
                return result.Content as CharacterDetails;
            } else {
                return undefined;
            }
        },
        async getCharacterImages(ids: number[]) {
            const applicationStore = useApplicationStore();
            applicationStore.processing = true;
            this.characterImages = await getCharacterImages(ids);
            applicationStore.processing = false;
        },
        async getCharacters() {
            const applicationStore = useApplicationStore();
            applicationStore.processing = true;
            this.characterCount = await getCharacterCount();
            this.characterList = await getCharacters(applicationStore.characterQueryOptions);
            this.characterImages = await getCharacterImages(this.characterList.map((char) => char.id as number));
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
