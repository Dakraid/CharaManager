<script setup lang="ts">
import { Button } from '~/components/ui/button';
import { toast } from '~/components/ui/toast';
import type ApiResponse from '~/models/ApiResponse';
import type { FileUpload } from '~/models/OLD/FileUpload';
import StatusCode from '~/models/enums/StatusCode';

const nuxtApp = useNuxtApp();

const settingsStore = useSettingsStore();
const controlComponentStore = useControlComponentStore();

const files = ref<FileUpload[]>([]);
const fileInput = ref<HTMLInputElement>();

const updateStore = async () => {
    files.value = controlComponentStore.files;
};

controlComponentStore.$subscribe(updateStore);

const onFileChange = async (e: any) => {
    const fileList = e.target.files || e.dataTransfer.files;
    if (!fileList.length) return;

    const serializeFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
            files.value.push({
                name: file.name,
                lastModified: file.lastModified,
                content: e.target.result,
            });
        };
        reader.readAsDataURL(file);
    };

    for (const file of fileList) {
        serializeFile(file);
    }
};

const uploadFiles = async () => {
    controlComponentStore.processing = true;
    if (files.value.length === 0) {
        toast({
            title: 'No images selected',
            description: 'Please select images before trying to upload.',
            variant: 'destructive',
        });
        return;
    }

    files.value.sort(function (a, b) {
        return b.lastModified - a.lastModified;
    });

    const response = await $fetch<ApiResponse>('/api/characters', {
        method: 'PUT',
        headers: { 'x-api-key': settingsStore.apiKey },
        body: {
            files: files.value,
        },
    });

    if (response.Status === StatusCode.OK) {
        toast({
            title: response.Message,
            description: response.Content,
        });
    } else {
        toast({
            title: response.Message,
            description: response.Content,
            variant: 'destructive',
        });
    }

    files.value.length = 0;

    if (fileInput.value) {
        // TODO: Make file upload a form so it can be reset properly
        fileInput.value.value = '';
    }

    controlComponentStore.processing = false;
    await nuxtApp.hooks.callHook('refresh:characters');
};

nuxtApp.hooks.hook('action:upload', async () => {
    await uploadFiles();
});
</script>

<template>
    <Label class="text-1xl" for="file-input">Upload</Label>
    <Input id="file-input" ref="fileInput" class="min-h-9" accept="image/png" multiple name="files[]" type="file" @change="onFileChange" />
    <Button type="submit" variant="secondary" @click="uploadFiles">
        <span class="sr-only">Upload File(s)</span>
        <Icon class="h-6 w-6" name="radix-icons:upload" />
    </Button>
</template>

<style scoped></style>
