<script setup lang="ts">
import type { CharacterCard } from '~/models/CharacterCard';
import { useToast } from '~/components/ui/toast';
import type { StatusResponse } from '~/models/StatusResponse';
import type { CharacterDefinitionGetRequest } from '~/models/CharacterDefinitionGetRequest';
import * as Cards from 'character-card-utils';
const { toast } = useToast();
const emit = defineEmits(['close-character']);

const props = defineProps<{
    character: CharacterCard;
}>();

const characterData = ref();
const characterDump = ref('');

const body: CharacterDefinitionGetRequest = { id: props.character.id as number };
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
    emit('close-character');
} else {
    try {
        const parsed = JSON.parse(response.content.json);
        characterData.value = Cards.parseToV2(parsed);
        characterDump.value = JSON.stringify(parsed.data);
    } catch (e) {
        console.error(e);
        emit('close-character');
    }
}
</script>

<template>
    <Card v-if="characterData" class="flex flex-col flex-grow items-center h-full w-full p-2">
        <Button variant="outline" size="icon" class="absolute right-20" @click="$emit('close-character')">
            <Icon name="radix-icons:cross-1" class="w-4 h-4" />
        </Button>
        <CardHeader class="flex flex-col p-2 w-full">
            <CardTitle class="font-bold text-4xl">{{ characterData.data.name }}</CardTitle>
            <CardDescription>Filename: {{ character.file_name }} | Last Modified at {{ character.formatted_timestamp }} | Created by {{ characterData.data.creator }}</CardDescription>
        </CardHeader>
        <CardContent class="p-2 w-full">
            <div class="flex flex-row gap-2 w-full h-full">
                <img :key="character.file_name" :alt="character.file_name" :src="character.image_content" class="character-card-large rounded-2xl" />
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
