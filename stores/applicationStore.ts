import type { CharactersGetRequest } from '~/models/CharactersGetRequest';
import type { CharactersDeleteRequest } from '~/models/CharactersDeleteRequest';
import type { Character } from '~/models/Character';

export const useApplicationStore = defineStore('application', {
    state: () => {
        return {
            provisioned: false,
            processing: true,
            censorChars: false,
            censorNames: false,
            searchValue: '',
            orderByValue: 'time_desc',
            deleteOptions: {} as CharactersDeleteRequest,
            currentPage: 1,
            itemsPerPage: 5,
            characterInstance: undefined as Character | undefined,
            showCharacterWindow: false,
        };
    },
    getters: {
        queryOptions: (state) =>
            <CharactersGetRequest>{
                page: state.currentPage,
                count: state.itemsPerPage,
                order: state.orderByValue,
                filter: state.searchValue.trim().length > 0 ? state.searchValue : undefined,
            },
    },
    actions: {},
});
