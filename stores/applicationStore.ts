import type { CharacterDetails } from '~/models/CharacterDetails';
import GetCharactersRequest from '~/models/GetCharactersRequest';
import GetImagesRequest from '~/models/GetImagesRequest';

export const useApplicationStore = defineStore('application', {
    state: () => {
        return {
            provisioned: false,
            loadingCharacters: true,
            searchValue: '',
            currentPage: 1,
            characterInstance: undefined as CharacterDetails | undefined,
            showCharacterWindow: false,
            showDiffWindow: false,
            showCropperWindow: false,
            updatedImageId: undefined as number | undefined,
            operationEnabledIds: new Set<number>(),
            itemsPerPage: 5,
        };
    },
    getters: {
        characterQueryOptions: (state: any) => {
            const settings = useSettingsStore();
            return new GetCharactersRequest(state.currentPage, state.searchValue, state.itemsPerPage, settings.orderByValue);
        },
        getCharacterInstance: (state: any) => {
            if (state.characterInstance === undefined) {
                const nuxtApp = useNuxtApp();
                nuxtApp.$logger().error('Character instance is empty, but was requested.');

                return undefined;
            }

            return state.characterInstance;
        },
    },
});
