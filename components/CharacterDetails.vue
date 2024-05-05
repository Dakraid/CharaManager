<script setup lang="ts">
import type { CharacterCard } from '~/models/CharacterCard';
defineEmits(['close-character']);

const props = defineProps<{
    character: CharacterCard;
}>();

const characterData = processCharacterData(props.character.image_content);
const characterDump = JSON.stringify(characterData.data);
</script>

<template>
    <Card class="flex flex-col flex-grow items-center h-full w-full p-2">
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
