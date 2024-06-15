<script setup lang="ts">
import FilePondPluginImageEditor from '@pqina/filepond-plugin-image-editor';
import {
    createDefaultImageOrienter,
    createDefaultImageReader,
    createDefaultImageWriter,
    legacyDataToImageState,
    locale_en_gb,
    markup_editor_defaults,
    markup_editor_locale_en_gb,
    openEditor,
    plugin_annotate,
    plugin_annotate_locale_en_gb,
    plugin_crop,
    plugin_crop_locale_en_gb,
    plugin_filter,
    plugin_filter_defaults,
    plugin_filter_locale_en_gb,
    plugin_finetune,
    plugin_finetune_defaults,
    plugin_finetune_locale_en_gb,
    processImage,
    setPlugins,
} from '@pqina/pintura';
import '@pqina/pintura/pintura.css';
import FilePondPluginFilePoster from 'filepond-plugin-file-poster';
import 'filepond-plugin-file-poster/dist/filepond-plugin-file-poster.min.css';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import 'filepond/dist/filepond.min.css';
import { ref } from 'vue';
import vueFilePond from 'vue-filepond';
import { Button } from '~/components/ui/button';
import { toast } from '~/components/ui/toast';
import type ApiResponse from '~/models/ApiResponse';
import type { FileUpload } from '~/models/OLD/FileUpload';
import StatusCode from '~/models/enums/StatusCode';

const nuxtApp = useNuxtApp();

const settingsStore = useSettingsStore();
const controlComponentStore = useControlComponentStore();

const files = ref<FileUpload[]>([]);

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

    controlComponentStore.processing = false;
    await nuxtApp.hooks.callHook('refresh:characters');
};

setPlugins(plugin_crop, plugin_finetune, plugin_filter, plugin_annotate);

const Filepond = vueFilePond(FilePondPluginFileValidateType, FilePondPluginImageEditor, FilePondPluginFilePoster);

const pondFiles = ref([]);

function onUpdateFiles(files: any) {
    pondFiles.value = files;
}

const myEditor = {
    legacyDataToImageState: legacyDataToImageState,
    createEditor: openEditor,
    imageReader: [createDefaultImageReader],
    imageWriter: [createDefaultImageWriter],
    imageProcessor: processImage,
    editorOptions: {
        utils: ['crop', 'finetune', 'filter', 'annotate'],
        imageOrienter: createDefaultImageOrienter(),
        ...plugin_finetune_defaults,
        ...plugin_filter_defaults,
        ...markup_editor_defaults,
        locale: {
            ...locale_en_gb,
            ...plugin_crop_locale_en_gb,
            ...plugin_finetune_locale_en_gb,
            ...plugin_filter_locale_en_gb,
            ...plugin_annotate_locale_en_gb,
            ...markup_editor_locale_en_gb,
        },
        imageCropAspectRatio: 2 / 3,
    },
};
</script>

<template>
    <Label class="text-1xl" for="file-input">Upload</Label>
    <ClientOnly>
        <Filepond ref="pond" accepted-file-types="image/png" :allow-multiple="true" :image-editor="myEditor" :credits="false" @updatefiles="onUpdateFiles" />
    </ClientOnly>
    <Transition>
        <Button v-if="pondFiles.length > 0" type="submit" variant="secondary" @click="uploadFiles">
            <span class="sr-only">Upload File(s)</span>
            <Icon class="h-6 w-6" name="radix-icons:upload" />
        </Button>
    </Transition>
</template>

<style>
@media (prefers-color-scheme: dark) {
    .filepond--panel-root {
        background-color: hsl(var(--background));
        border-color: hsl(var(--input));
        border-width: 1px;
        border-radius: calc(var(--radius) - 2px);
    }

    .filepond--label-action {
        text-decoration-color: hsl(var(--primary));
    }

    .filepond--drop-label {
        color: hsl(var(--primary));
    }

    .filepond--drip {
        background: hsl(var(--input));
    }

    .filepond--drip-blob {
        background-color: hsl(var(--primary));
    }

    .pintura-editor {
        --color-background: hsl(240 3.7% 15.9%);
        --color-foreground: hsl(0 0% 98%);
        --color-primary-text: hsl(0 0% 98%);
        --color-primary: hsl(240 3.7% 15.9%);
        --color-primary-dark: hsl(0 0% 98%);
        box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1);
    }
}
</style>
