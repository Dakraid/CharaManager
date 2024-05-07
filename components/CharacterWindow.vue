<script setup lang="ts">
import type { StatusResponse } from '~/models/StatusResponse';
import type { CharacterDefinitionGetRequest } from '~/models/CharacterDefinitionGetRequest';
import type { Character } from '~/models/Character';
import * as Cards from 'character-card-utils';
import { useApplicationStore } from '~/stores/applicationStore';
import { useToast } from '~/components/ui/toast';

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
            title: 'Could not retrieve character data.',
            description: 'The character data seems to be corrupted, remove the character and re-download it.',
            variant: 'destructive',
        });
    } else {
        try {
            const parsed = JSON.parse(response.content.json);
            characterData.value = Cards.parseToV2(parsed);
            characterDump.value = JSON.stringify(parsed.data);
        } catch (e) {
            console.error(e);
        }
    }
};

const closeCharacterWindow = async () => {
    applicationStore.showCharacterWindow = false;
    applicationStore.characterInstance = undefined;
};

await updateApplicationState();
await processCharacterDetails();
</script>

<template>
    <Card v-if="characterData" class="flex flex-col flex-grow items-center h-full w-full p-2">
        <Button variant="outline" size="icon" class="absolute right-20" @click="closeCharacterWindow">
            <Icon name="radix-icons:cross-1" class="w-4 h-4" />
        </Button>
        <CardHeader class="flex flex-col p-2 w-full">
            <CardTitle class="font-bold text-4xl">{{ characterData.data.name }}</CardTitle>
            <CardDescription
                >Filename: {{ characterInstance?.file_name }} | Last Modified at {{ characterInstance?.formatted_timestamp }} | Created by {{ characterData.data.creator }}</CardDescription
            >
        </CardHeader>
        <CardContent class="p-2 w-full">
            <div class="flex flex-row gap-2 w-full h-full">
                <img :key="characterInstance?.file_name" :alt="characterInstance?.file_name" :src="characterInstance?.image_content" class="character-card-large rounded-2xl" />
                <div class="flex flex-col gap-2 w-full h-full">
                    <Label for="description">Description</Label>
                    <Textarea id="description" v-model="characterData.data.description" class="flex-grow w-full h-full" />
                    <Label for="first_message">First Message</Label>
                    <Textarea id="first_message" v-model="characterData.data.first_mes" class="flex-grow w-full h-full" />
                </div>
            </div>
        </CardContent>
        <CardFooter class="p-2 w-full h-full">
            <div class="flex flex-col gap-2 w-full h-full">
                <Label for="dump">Dump</Label>
                <Textarea id="dump" v-model="characterDump" class="flex-grow w-full h-full" />
            </div>
        </CardFooter>
    </Card>
</template>

<style scoped></style>
