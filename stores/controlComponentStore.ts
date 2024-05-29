import type { FileUpload } from '~/models/OLD/FileUpload';

export const useControlComponentStore = defineStore('controlComponent', {
    state: () => {
        return {
            processing: false,
            files: [] as FileUpload[],
        };
    },
});
