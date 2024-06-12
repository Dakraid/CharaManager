import { debounce } from 'perfect-debounce';
import type { CharacterDetails } from '~/models/CharacterDetails';
import GetCharactersRequest from '~/models/GetCharactersRequest';

const setLoadingDebounced = debounce(
    async (loading: boolean) => {
        const applicationState = useApplicationStore();
        if (applicationState.loadingCharacters !== loading) {
            applicationState.loadingCharacters = loading;
        }
    },
    500,
    { leading: true }
);

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
    actions: {
        async updateLoadingState(loading: boolean) {
            await setLoadingDebounced(loading);
        },
    },
});
