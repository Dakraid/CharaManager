<script setup lang="ts">
import { Button } from '~/components/ui/button';
import { toast } from '~/components/ui/toast';
import type ApiResponse from '~/models/ApiResponse';
import DatabaseRequest from '~/models/DatabaseRequest';
import { DatabaseAction } from '~/models/enums/DatabaseAction';
import StatusCode from '~/models/enums/StatusCode';

const nuxtApp = useNuxtApp();

const settingsStore = useSettingsStore();
const controlComponentStore = useControlComponentStore();

const processing = ref(false);

const generateThumbnails = async () => {
    controlComponentStore.processing = true;

    const response = await $fetch<ApiResponse>('/api/images', {
        method: 'PATCH',
        headers: { 'x-api-key': settingsStore.apiKey },
        timeout: 300000,
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

    controlComponentStore.processing = false;
};

const updateCharacters = async () => {
    controlComponentStore.processing = true;

    const response = await $fetch<ApiResponse>('/api/database', {
        method: 'POST',
        headers: { 'x-api-key': settingsStore.apiKey },
        body: JSON.stringify(new DatabaseRequest(DatabaseAction.Update)),
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

    controlComponentStore.processing = false;
};

const synchronizeDefinitions = async () => {
    controlComponentStore.processing = true;

    const response = await $fetch<ApiResponse>('/api/database', {
        method: 'POST',
        headers: { 'x-api-key': settingsStore.apiKey },
        body: JSON.stringify(new DatabaseRequest(DatabaseAction.Synchronize)),
    });

    if (response.Status === StatusCode.OK) {
        toast({
            title: response.Message,
            description: response.Content,
        });
    }

    controlComponentStore.processing = false;
};

const synchronizeRelations = async () => {
    controlComponentStore.processing = true;

    const response = await $fetch<ApiResponse>('/api/relations', {
        method: 'PUT',
        headers: { 'x-api-key': settingsStore.apiKey },
        timeout: 900000,
    });

    if (response.Status === StatusCode.OK) {
        toast({
            title: response.Message,
            description: response.Content,
        });
    }

    controlComponentStore.processing = false;
};

const deleteCharacters = async () => {
    controlComponentStore.processing = true;

    const response = await $fetch<ApiResponse>('/api/database', {
        method: 'DELETE',
        headers: { 'x-api-key': settingsStore.apiKey },
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

    controlComponentStore.processing = false;
    await nuxtApp.hooks.callHook('refresh:characters');
};

onMounted(async () => {
    const updateStore = async () => {
        processing.value = controlComponentStore.processing;
    };

    controlComponentStore.$subscribe(updateStore);
    await updateStore();
});
</script>

<template>
    <div class="flex flex-col md:order-2 w-full h-full max-w-sm gap-4">
        <ControlsGeneralFileUpload />
        <Separator />
        <ControlsGeneralOptions />
        <Separator />
        <div class="h-full" />
        <div v-if="processing" class="h-full flex items-center justify-center">
            <Icon class="h-16 w-16" name="line-md:loading-loop" />
        </div>
        <div class="h-full" />
        <Separator />
        <Label class="text-1xl">Reload Characters from Database</Label>
        <Button type="submit" variant="outline" @click="nuxtApp.hooks.callHook('refresh:characters')">
            <span class="sr-only">Reload Character List</span>
            <Icon class="h-6 w-6" name="radix-icons:symbol" />
        </Button>
        <Label class="text-1xl">Generate Thumbnails</Label>
        <Button type="submit" variant="outline" @click="generateThumbnails">
            <span class="sr-only">Generate Thumbnails</span>
            <Icon class="h-6 w-6" name="radix-icons:image" />
        </Button>
        <Label class="text-1xl" for="update-database">Update all v1 to v2</Label>
        <Button id="update-database" type="submit" variant="outline" @click="updateCharacters">
            <span class="sr-only">Update all v1 to v2</span>
            <Icon class="h-6 w-6" name="radix-icons:timer" />
        </Button>
        <Label class="text-1xl" for="sync-definitions">Synchronize Definitions</Label>
        <Button id="sync-definitions" type="submit" variant="outline" @click="synchronizeDefinitions">
            <span class="sr-only">Synchronize Definitions</span>
            <Icon class="h-6 w-6" name="radix-icons:symbol" />
        </Button>
        <Label class="text-1xl" for="sync-relations">Synchronize Relations</Label>
        <Button id="sync-relations" type="submit" variant="outline" @click="synchronizeRelations">
            <span class="sr-only">Synchronize Relations</span>
            <Icon class="h-6 w-6" name="radix-icons:symbol" />
        </Button>
        <Separator />
        <Label class="text-1xl" for="delete-files">Delete All Files</Label>
        <AlertDialog>
            <AlertDialogTrigger as-child>
                <Button id="delete-files" type="submit" variant="destructive">
                    <span class="sr-only">Delete All File(s)</span>
                    <Icon class="h-6 w-6" name="radix-icons:trash" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>This action cannot be undone. This will permanently delete your characters and remove your data from the database.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction @click="deleteCharacters">Continue</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
</template>

<style scoped></style>
