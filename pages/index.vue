<script lang="ts" setup>
import '~/assets/css/style.css';
import { useCharacterStore } from '~/stores/characterStore';
import { useApplicationStore } from '~/stores/applicationStore';
import type { CharacterCard } from '~/models/CharacterCard';

const characterStore = useCharacterStore();
const characterCount = ref(0);
const characters = ref([] as CharacterCard[]);

const updateCharacters = async () => {
    characterCount.value = characterStore.characterCount;
    characters.value = characterStore.characterList;
};

characterStore.$subscribe(updateCharacters);

const applicationStore = useApplicationStore();
const processing = ref(true);

const updateApplication = async () => {
    processing.value = applicationStore.processing;
};

applicationStore.$subscribe(updateApplication);

const getCharacters = async () => {
    await characterStore.loadCharacters();
};

const showCharacterWindow = ref(false);
const characterRef = ref();

const openCharacterWindow = async (character: CharacterCard) => {
    characterRef.value = character;
    showCharacterWindow.value = true;
};

const closeCharacterWindow = async () => {
    characterRef.value = null;
    showCharacterWindow.value = false;
};
</script>

<template>
    <div class="grid h-full overflow-y-hidden py-6 lg:px-24 items-stretch gap-6 md:grid-cols-[minmax(0,1fr)_300px]">
        <SideBar @update-characters="getCharacters" />
        <div id="main_content" class="flex flex-col h-full overflow-y-hidden gap-2 md:order-1 mt-0 border-0 p-0">
            <ControlBar @update-characters="getCharacters" />
            <ScrollArea id="scrollArea" class="w-full h-full overflow-y-hidden rounded-md border p-4 pr-6">
                <div v-if="showCharacterWindow" class="absolute backdrop-blur bg-background/80 transition-all w-full h-full inset-0 z-10 p-16 rounded-md flex flex-1 justify-center items-center">
                    <CharacterDetails :character="characterRef" @close-character="closeCharacterWindow" />
                </div>
                <div v-if="processing" class="absolute backdrop-blur bg-background/80 transition-all w-full h-full inset-0 z-10 rounded-md flex flex-1 justify-center items-center">
                    <Icon class="w-16 h-16 animate-spin" name="radix-icons:reload" />
                </div>
                <div v-else-if="characters.length === 0" class="flex flex-1 flex-col gap-2 justify-center items-center">
                    <h1 class="font-bold text-2xl">No characters found</h1>
                    <Icon class="w-16 h-16" name="radix-icons:question-mark-circled" />
                    <h2 class="font-bold text-xl">Upload characters to see them here</h2>
                </div>
                <div v-else class="flex flex-wrap gap-2 justify-between h-full overflow-hidden">
                    <CharacterSimple v-for="character in characters" :key="character.id" :character="character" @open-characterwindow="openCharacterWindow(character)" />
                </div>
            </ScrollArea>
        </div>
    </div>
</template>

<style scoped></style>
