<script lang="ts" setup>
import type { CharacterDetails } from '~/models/CharacterDetails';
import DatabaseRequest from '~/models/DatabaseRequest';
import { DatabaseAction } from '~/models/enums/DatabaseAction';
import { useCharacterStore } from '~/stores/characterStore';

const keyStore = useKeyStore();

const characterStore = useCharacterStore();
const characterCount = ref(0);
const characters = ref([] as CharacterDetails[]);

const updateCharacters = async () => {
    characterCount.value = characterStore.characterCount;
    characters.value = characterStore.characterList;
};

characterStore.$subscribe(updateCharacters);

const applicationStore = useApplicationStore();
const processing = ref(false);
const showCharacterWindow = ref(false);

const updateApplication = async () => {
    processing.value = applicationStore.processing;
    showCharacterWindow.value = applicationStore.showCharacterWindow;
};

applicationStore.$subscribe(updateApplication);

const getCharacters = async () => {
    await characterStore.getCharacters();
};

if (!applicationStore.provisioned) {
    await $fetch('/api/database', {
        method: 'POST',
        headers: { 'x-api-key': keyStore.apiKey },
        body: JSON.stringify(new DatabaseRequest(DatabaseAction.Provision)),
    });

    applicationStore.provisioned = true;
}

applicationStore.showCharacterWindow = false;

onMounted(async () => {
    await getCharacters();
});
</script>

<template>
    <div class="grid character-container h-full overflow-y-hidden py-6 lg:px-6 items-stretch gap-6">
        <div id="main_content" class="flex flex-col h-full gap-2 order-1 mt-0 border-0 p-0 items-stretch 2xl:overflow-y-hidden">
            <Transition>
                <div v-if="showCharacterWindow" class="absolute backdrop-blur bg-background/50 transition-all w-full h-full inset-0 z-20 p-12 rounded-md overflow-hidden">
                    <CharacterWindow />
                </div>
            </Transition>
            <ControlBar @update-characters="getCharacters" />
            <ScrollArea id="scrollArea" class="w-full h-full overflow-y-hidden rounded-md border">
                <Transition>
                    <div v-if="processing" class="absolute backdrop-blur bg-background/80 transition-all w-full h-full inset-0 z-10 rounded-md flex flex-1 justify-center items-center">
                        <Icon class="w-16 h-16 animate-spin" name="radix-icons:reload" />
                    </div>
                    <div v-else-if="characters.length === 0" class="flex flex-1 flex-col gap-2 justify-center items-center">
                        <h1 class="font-bold text-2xl">No characters found</h1>
                        <Icon class="w-16 h-16" name="radix-icons:question-mark-circled" />
                        <h2 class="font-bold text-xl">Upload characters to see them here</h2>
                    </div>
                    <div v-else class="flex flex-wrap gap-2 justify-between h-full overflow-hidden p-8">
                        <CharacterCard v-for="character in characters" :key="character.id" :character="character" />
                    </div>
                </Transition>
            </ScrollArea>
        </div>
        <SideBar class="order-2" @update-characters="getCharacters" />
    </div>
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
