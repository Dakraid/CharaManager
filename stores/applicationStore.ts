import type { CharacterDetails } from '~/models/CharacterDetails';
import GetCharactersRequest from "~/models/GetCharactersRequest";

export const useApplicationStore = defineStore('application', {
    state: () => {
        return {
            provisioned: false,
            processing: true,
            censorChars: false,
            censorNames: false,
            searchValue: '',
            orderByValue: 'time_desc',
            currentPage: 1,
            itemsPerPage: 5,
            characterInstance: undefined as CharacterDetails | undefined,
            showCharacterWindow: false,
        };
    },
    getters: {
        queryOptions: (state: any) => new GetCharactersRequest(state.currentPage, state.itemsPerPage, state.orderByValue, state.searchValue)
    },
});
