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
            updatedImageId: undefined as number | undefined,
            operationEnabledIds: new Set<number>(),
        };
    },
    getters: {
        characterQueryOptions: (state: any) => {
            const settings = useSettingsStore();
            return new GetCharactersRequest(state.currentPage, state.searchValue, settings.itemsPerPage, settings.orderByValue);
        },
    },
});
