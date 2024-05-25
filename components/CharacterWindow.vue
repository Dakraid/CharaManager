<script setup lang="ts">
import { useDropZone } from '@vueuse/core';
import * as Cards from 'character-card-utils';
import VuePictureCropper, { cropper } from 'vue-picture-cropper';
import { Button } from '~/components/ui/button';
import { useToast } from '~/components/ui/toast';
import { cn } from '~/lib/utils';
import type ApiResponse from '~/models/ApiResponse';
import type { CharacterDetails } from '~/models/CharacterDetails';
import PutDefinitionRequest from '~/models/PutDefinitionRequest';
import StatusCode from '~/models/enums/StatusCode';
import encodeArrayBufferToUrlSafeBase64 from '~/utils/encodeArrayBufferToUrlSafeBase64';

const { toast } = useToast();

const imageContent = ref('');
const imageBlob = ref();

const characterData = ref();
const characterDump = ref('');
const characterInstance = ref<CharacterDetails>();

const showCharacterWindow = ref(false);
const showCropperWindow = ref(false);

const keyStore = useKeyStore();
const characterStore = useCharacterStore();
const applicationStore = useApplicationStore();

const updateApplicationState = async () => {
    characterInstance.value = applicationStore.characterInstance;
    showCharacterWindow.value = applicationStore.showCharacterWindow;
};

applicationStore.$subscribe(updateApplicationState);

const getCharacterImage = async () => {
    const { data: response } = await useFetch<ApiResponse>('/api/image', {
        method: 'GET',
        headers: { 'x-api-key': keyStore.apiKey },
        query: { id: characterInstance.value?.id },
    });

    if (response.value?.Status === StatusCode.OK) {
        imageContent.value = response.value.Content.content;
        const updatedImages = characterStore.characterImages.filter(x => x.id !== characterInstance.value?.id);
        updatedImages.push({ id: characterInstance.value?.id as number, content: undefined, content_small: response.value.Content.content_small });
        characterStore.characterImages = updatedImages;
    } else {
        toast({
            title: response.value?.Message,
            description: response.value?.Content,
            variant: 'destructive',
        });
    }
}

const processCharacterDetails = async () => {
    const { data: response } = await useFetch<ApiResponse>('/api/definition', {
        method: 'GET',
        headers: { 'x-api-key': keyStore.apiKey },
        query: { id: characterInstance.value?.id },
    });

    if (response.value?.Status === StatusCode.OK) {
        try {
            const parsed = JSON.parse(response.value?.Content.json);
            characterData.value = Cards.parseToV2(parsed);
        } catch (e) {
            console.error(e);
            applicationStore.showCharacterWindow = false;
            applicationStore.characterInstance = undefined;
        }
    } else {
        toast({
            title: response.value?.Message,
            description: response.value?.Content,
            variant: 'destructive',
        });
    }
};

const addGreeting = async () => {
    characterData.value.data.alternate_greetings.push('');
};

const saveCharacter = async () => {
    const response = await $fetch<ApiResponse>('/api/definition', {
        method: 'PUT',
        headers: { 'x-api-key': keyStore.apiKey },
        body: JSON.stringify(new PutDefinitionRequest(characterInstance.value?.id as number, JSON.stringify(characterData.value))),
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
};

const closeCharacterWindow = async () => {
    applicationStore.showCharacterWindow = false;
    applicationStore.characterInstance = undefined;
};

const dropZoneRef = ref<HTMLDivElement>();

async function onDrop(files: File[] | null) {
    if (!files) {
        return;
    }

    if (files.length > 1) {
        toast({
            title: 'Only one image may be uploaded',
        });
    }

    imageBlob.value = URL.createObjectURL(files[0]);
    showCropperWindow.value = true;
}

const submitCroppedImage = async () => {
    const croppedImage = await cropper?.getFile();
    if (!croppedImage) {
        toast({
            title: 'Cropped image is invalid',
            variant: 'destructive',
        });
        return;
    }

    showCropperWindow.value = false;
    URL.revokeObjectURL(imageBlob.value);
    imageBlob.value = null;

    const response = await $fetch<ApiResponse>('/api/image', {
        method: 'PATCH',
        headers: { 'x-api-key': keyStore.apiKey },
        body: {
            Id: characterInstance.value?.id as number,
            File: encodeArrayBufferToUrlSafeBase64(await croppedImage.arrayBuffer()),
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

    await getCharacterImage();
};

const { isOverDropZone } = useDropZone(dropZoneRef, {
    onDrop,
    dataTypes: ['image/png', 'image/jpeg', 'image/bmp', 'image/tiff'],
});

await updateApplicationState();
await getCharacterImage();
await processCharacterDetails();
</script>

<template>
    <Card v-if="characterData" class="h-full flex flex-col flex-1 items-center p-2 overflow-y-auto">
        <Button variant="outline" size="icon" class="absolute w-11 h-11 top-16 right-16" @click="closeCharacterWindow">
            <Icon name="radix-icons:cross-1" class="w-4 h-4" />
        </Button>
        <CardHeader class="flex flex-col p-2 w-full">
            <CardTitle class="font-bold text-4xl">{{ characterData.data.name }}</CardTitle>
        </CardHeader>
        <CardContent :class="cn('p-2 w-full flex-1 overflow-hidden', showCropperWindow ? 'overflow-hidden' : '')">
            <div v-if="showCropperWindow" class="flex w-full h-full rounded-2xl overflow-hidden">
                <client-only>
                    <VuePictureCropper
                        class="bg-accent rounded-2xl"
                        :img="imageBlob"
                        :boxStyle="{
                            width: '100%',
                            height: '100%',
                            margin: 'auto'
                        }"
                        :options="{
                            viewMode: 1,
                            dragMode: 'move',
                            cropBoxResizable: false,
                            aspectRatio: 2 / 3,
                        }"
                        :presetMode="{
                            mode: 'fixedSize',
                            width: 512,
                            height: 768
                        }" />
                </client-only>
            </div>
            <div v-else class="flex flex-row gap-2 w-full h-full">
                <div class="flex flex-col justify-center items-center rounded-2xl border border-accent">
                    <div ref="dropZoneRef" class="rounded-2xl dropzone">
                        <img :alt="characterInstance?.file_name" :src="imageContent" class="character-card-large rounded-2xl" />
                    </div>
                </div>
                <Tabs default-value="general" class="w-full">
                    <TabsList class="w-full flex justify-around">
                        <TabsTrigger class="flex-grow" value="general"> General </TabsTrigger>
                        <TabsTrigger class="flex-grow" value="alternatives"> Alternative Greetings </TabsTrigger>
                        <TabsTrigger class="flex-grow" value="examples"> Message Examples </TabsTrigger>
                        <TabsTrigger class="flex-grow" value="prompts"> Prompt Overrides </TabsTrigger>
                        <TabsTrigger class="flex-grow" value="creator"> Creator Metadata </TabsTrigger>
                        <TabsTrigger
                            class="flex-grow"
                            value="json"
                            @click="
                                () => {
                                    characterDump = JSON.stringify(characterData.data, null, 4);
                                }
                            ">
                            JSON Dump
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent class="h-full" value="general">
                        <div class="flex tab-content-character flex-col gap-2">
                            <div class="flex flex-col gap-2 flex-1">
                                <Label for="description">Description</Label>
                                <Textarea id="description" v-model="characterData.data.description" class="flex-grow" />
                            </div>
                            <div class="flex flex-col gap-2 flex-1">
                                <Label for="first_message">First Message</Label>
                                <Textarea id="first_message" v-model="characterData.data.first_mes" class="flex-grow" />
                            </div>
                            <div class="flex flex-col gap-2 flex-1">
                                <Label for="personality">Personality</Label>
                                <Textarea id="personality" v-model="characterData.data.personality" class="flex-grow" />
                            </div>
                            <div class="flex flex-col gap-2 flex-1">
                                <Label for="scenario">Scenario</Label>
                                <Textarea id="scenario" v-model="characterData.data.scenario" class="flex-grow" />
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent class="h-full" value="alternatives">
                        <div class="flex tab-content-character flex-col gap-2">
                            <div class="flex justify-between items-end">
                                <span class="text-sm font-medium align-text-bottom leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Alt Messages</span>
                                <Button id="save" type="submit" variant="secondary" @click="addGreeting">
                                    <span class="sr-only">Add Greeting</span>
                                    <Icon class="h-6 w-6" name="radix-icons:plus" />
                                </Button>
                            </div>
                            <div v-for="(item, index) in characterData.data.alternate_greetings" :key="item" class="flex-grow">
                                <Textarea v-model="characterData.data.alternate_greetings[index]" class="h-full" />
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent class="h-full" value="examples">
                        <div class="flex tab-content-character flex-col gap-2">
                            <div class="flex flex-col gap-2 flex-1">
                                <Label for="examples">Message Examples</Label>
                                <Textarea id="examples" v-model="characterData.data.mes_example" class="flex-grow" />
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent class="h-full" value="prompts">
                        <div class="flex tab-content-character flex-col gap-2">
                            <div class="flex flex-col gap-2 flex-1">
                                <Label for="system_prompt">System Prompt</Label>
                                <Textarea id="system_prompt" v-model="characterData.data.system_prompt" class="flex-grow" />
                            </div>
                            <div class="flex flex-col gap-2 flex-1">
                                <Label for="post_history_instructions">Jailbreak</Label>
                                <Textarea id="post_history_instructions" v-model="characterData.data.post_history_instructions" class="flex-grow" />
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent class="h-full" value="creator">
                        <div class="flex tab-content-character flex-col gap-2">
                            <div class="flex flex-col gap-2">
                                <Label for="creator">Creator</Label>
                                <Textarea id="creator" v-model="characterData.data.creator" class="flex-grow" />
                            </div>
                            <div class="flex flex-col gap-2 flex-1">
                                <Label for="creator_notes">Creator Notes</Label>
                                <Textarea id="creator_notes" v-model="characterData.data.creator_notes" class="flex-grow" />
                            </div>
                            <div class="flex flex-col gap-2">
                                <Label for="character_version">Character Version</Label>
                                <Textarea id="character_version" v-model="characterData.data.character_version" class="flex-grow" />
                            </div>
                            <div class="flex flex-col gap-2">
                                <Label>Tags</Label>
                                <TagsInput v-model="characterData.data.tags" class="flex-grow">
                                    <TagsInputItem v-for="item in characterData.data.tags" :key="item" :value="item">
                                        <TagsInputItemText />
                                        <TagsInputItemDelete />
                                    </TagsInputItem>
                                    <TagsInputInput placeholder="Add Tag..." />
                                </TagsInput>
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent class="h-full" value="json">
                        <div class="flex tab-content-character flex-col gap-2">
                            <Label for="dump">JSON Dump</Label>
                            <Textarea id="dump" v-model="characterDump" class="flex-grow w-full h-full" disabled="disabled" />
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </CardContent>
        <CardFooter class="w-full p-2">
            <div v-if="showCropperWindow" class="w-full flex justify-between items-center">
                <span class="text-lg text-foreground"> Please adjust the image to fit. The required size is 512px by 768px as used by SillyTavern. </span>
                <Button id="crop" type="submit" variant="secondary" class="h-16 w-16" @click="submitCroppedImage">
                    <span class="sr-only">Crop</span>
                    <Icon class="h-8 w-8" name="radix-icons:check" />
                </Button>
            </div>
            <div v-else class="w-full flex justify-between items-center">
                <span class="text-sm text-muted-foreground">
                    ID: {{ characterInstance?.id }} | Filename: {{ characterInstance?.file_name }} | Last Modified at {{ characterInstance?.formatted_timestamp }}
                </span>
                <Button id="save" type="submit" variant="secondary" class="h-16 w-16" @click="saveCharacter">
                    <span class="sr-only">Save</span>
                    <Icon class="h-8 w-8" name="radix-icons:paper-plane" />
                </Button>
            </div>
        </CardFooter>
    </Card>
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
    transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
    opacity: 0;
}
</style>
