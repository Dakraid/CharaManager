import type { CharacterGetRequest } from '~/models/CharacterGetRequest';
import type { CharacterDeleteRequest } from '~/models/CharacterDeleteRequest';

export const useApplicationStore = defineStore('application', {
    state: () => {
        return {
            processing: true,
            censorChars: false,
            censorNames: false,
            searchValue: '',
            orderByValue: 'time_desc',
            deleteOptions: {} as CharacterDeleteRequest,
            currentPage: 1,
            itemsPerPage: 5,
        };
    },
    getters: {
        queryOptions: (state) =>
            <CharacterGetRequest>{
                page: state.currentPage,
                count: state.itemsPerPage,
                order: state.orderByValue,
                filter: state.searchValue.trim().length > 0 ? state.searchValue : undefined,
            },
    },
    actions: {},
});
