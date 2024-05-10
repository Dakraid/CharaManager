<script setup lang="ts">
import type { StatusResponse } from '~/models/StatusResponse';
import type { CharacterDefinitionGetRequest } from '~/models/CharacterDefinitionGetRequest';
import type { Character } from '~/models/Character';
import * as Cards from 'character-card-utils';
import { useApplicationStore } from '~/stores/applicationStore';
import { useToast } from '~/components/ui/toast';
import type { CharacterUpdateRequest } from '~/models/CharacterUpdateRequest';
import { Button } from '~/components/ui/button';
import { useDropZone } from '@vueuse/core';

const { toast } = useToast();

const applicationStore = useApplicationStore();
const processing = ref(true);
const characterInstance = ref<Character>();
const showCharacterWindow = ref(false);

const updateApplicationState = async () => {
    processing.value = applicationStore.processing;
    characterInstance.value = applicationStore.characterInstance;
    showCharacterWindow.value = applicationStore.showCharacterWindow;
};

applicationStore.$subscribe(updateApplicationState);

const characterData = ref();
const characterDump = ref('');

const processCharacterDetails = async () => {
    const body: CharacterDefinitionGetRequest = { id: characterInstance.value?.id as number };
    const response: StatusResponse = await $fetch('/api/character-details', {
        method: 'POST',
        body: body,
    });

    if (!response.content || response.status !== 200) {
        toast({
            title: 'Could not retrieve character data',
            description: 'The character data seems to be corrupted, remove the character and re-download it.',
            variant: 'destructive',
        });
    } else {
        try {
            const parsed = JSON.parse(JSON.parse(response.content.json));
            characterData.value = Cards.parseToV2(parsed);
        } catch (e) {
            console.error(e);
            applicationStore.showCharacterWindow = false;
            applicationStore.characterInstance = undefined;
        }
    }
};

const counter = ref(0);

const addGreeting = async () => {
    characterData.value.data.alternate_greetings.push('');
};

const saveCharacter = async () => {
    const request: CharacterUpdateRequest = { character: <Character>characterInstance.value, newContent: JSON.stringify(characterData.value), ratingOnly: false };
    const response: StatusResponse = await $fetch('/api/character', {
        method: 'PATCH',
        body: request,
    });

    if (response.status === 200) {
        toast({
            title: 'Successfully saved character',
        });
    }
};

const closeCharacterWindow = async () => {
    applicationStore.showCharacterWindow = false;
    applicationStore.characterInstance = undefined;
};

const dropZoneRef = ref<HTMLDivElement>();

function onDrop(files: File[] | null) {
    if (!files) {
        return;
    }

    if (files.length > 1) {
        toast({
            title: 'Only one image may be uploaded',
        });
    }

    console.log('Hello');

    // called when files are dropped on zone
}

const { isOverDropZone } = useDropZone(dropZoneRef, {
    onDrop,
    dataTypes: ['image/png'],
});

await updateApplicationState();
await processCharacterDetails();
</script>

<template>
    <Card v-if="characterData" class="flex flex-col flex-1 items-center p-2">
        <Button variant="outline" size="icon" class="absolute right-20" @click="closeCharacterWindow">
            <Icon name="radix-icons:cross-1" class="w-4 h-4" />
        </Button>
        <CardHeader class="flex flex-col p-2 w-full">
            <CardTitle class="font-bold text-4xl">{{ characterData.data.name }}</CardTitle>
            <CardDescription> </CardDescription>
        </CardHeader>
        <CardContent class="p-2 w-full">
            <div class="flex flex-row gap-2 w-full h-full">
                <div ref="dropZoneRef" class="rounded-2xl dropzone trans">
                    <img :key="characterInstance?.file_name" :alt="characterInstance?.file_name" :src="characterInstance?.image_content" class="character-card-large rounded-2xl" />
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
        <CardFooter class="flex justify-between w-full p-2">
            <span class="text-sm text-muted-foreground">Filename: {{ characterInstance?.file_name }} | Last Modified at {{ characterInstance?.formatted_timestamp }}</span>
            <Button id="save" type="submit" variant="secondary" @click="saveCharacter">
                <span class="sr-only">Save</span>
                <Icon class="h-6 w-6" name="radix-icons:paper-plane" />
            </Button>
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
