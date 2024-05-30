<script setup lang="ts">
import { Button } from '~/components/ui/button';
import { toast } from '~/components/ui/toast';
import type ApiResponse from '~/models/ApiResponse';
import type { FileUpload } from '~/models/OLD/FileUpload';
import StatusCode from '~/models/enums/StatusCode';

const nuxtApp = useNuxtApp();

const settingsStore = useSettingsStore();
const controlComponentStore = useControlComponentStore();

const characterUrl = ref('');
const fetchedCharacter = ref();
const showSkeleton = ref(false);
const processing = ref(false);

const downloadChubAiCharacter = async () => {
    if (characterUrl.value.trim().length === 0 || (!characterUrl.value.includes('chub.ai/characters/') && !characterUrl.value.includes('characterhub.org/characters/'))) {
        toast({
            title: 'Wrong URL',
            description: 'The URL you entered is not valid.',
            variant: 'destructive',
        });
        return;
    }

    showSkeleton.value = true;

    const response = await $fetch<ApiResponse>('/api/chubai', {
        method: 'POST',
        headers: { 'x-api-key': settingsStore.apiKey },
        body: { characterUrl: characterUrl.value },
    });

    if (response.Status === StatusCode.OK) {
        fetchedCharacter.value = response.Content;
    } else {
        toast({
            title: response.Message,
            description: response.Content,
            variant: 'destructive',
        });
    }

    showSkeleton.value = false;
};

const saveChubAiCharacter = async () => {
    if (fetchedCharacter.value) {
        controlComponentStore.processing = true;
        const response = await $fetch<ApiResponse>('/api/characters', {
            method: 'PUT',
            headers: { 'x-api-key': settingsStore.apiKey },
            body: {
                files: [fetchedCharacter.value],
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

        characterUrl.value = '';
        fetchedCharacter.value = undefined;
        controlComponentStore.processing = false;

        await nuxtApp.hooks.callHook('refresh:characters');
    }
};

const clearChubAiCharacter = async () => {
    characterUrl.value = '';
    fetchedCharacter.value = undefined;
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
    <ScrollArea class="h-full w-full">
        <div class="flex flex-col md:order-2 w-full h-full max-w-sm gap-4">
            <Label class="text-1xl" for="char-url">Character Download</Label>
            <Input id="char-url" v-model="characterUrl" class="min-h-9" type="url" placeholder="https://..." />
            <Button type="submit" variant="secondary" @click="downloadChubAiCharacter">
                <span class="sr-only">Download Character</span>
                <Icon class="h-6 w-6" name="radix-icons:download" />
            </Button>
            <div v-if="showSkeleton" class="flex flex-col items-center gap-4">
                <Skeleton class="w-[332px] h-[48px] rounded-2xl" />
                <Skeleton class="w-[332px] h-[516px] rounded-2xl" />
            </div>
            <div v-else-if="fetchedCharacter" class="flex flex-col items-center gap-4">
                <span>{{ fetchedCharacter.name }}</span>
                <img :src="fetchedCharacter.content" :alt="fetchedCharacter.name" class="character-card-chub rounded-2xl" />
                <div class="flex w-full gap-4">
                    <Button type="submit" variant="secondary" class="w-full" @click="saveChubAiCharacter">
                        <span>Save</span>
                    </Button>
                    <Button type="submit" variant="destructive" class="w-full" @click="clearChubAiCharacter">
                        <span>Clear</span>
                    </Button>
                </div>
            </div>
            <Separator />
            <div class="h-full" />
            <div v-if="processing" class="h-full flex items-center justify-center">
                <Icon class="h-16 w-16" name="line-md:loading-loop" />
            </div>
            <div class="h-full" />
        </div>
    </ScrollArea>
</template>

<style scoped></style>
