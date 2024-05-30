<script lang="ts" setup>
import { cn } from '~/lib/utils';
import type { CharacterDetails } from '~/models/CharacterDetails';
import DatabaseRequest from '~/models/DatabaseRequest';
import { DatabaseAction } from '~/models/enums/DatabaseAction';

const settingsStore = useSettingsStore();
const characterStore = useCharacterStore();
const applicationStore = useApplicationStore();

const characterCount = ref(0);
const characters = ref([] as CharacterDetails[]);

const loadingCharacters = ref(true);
const showCharacterWindow = ref(false);
const openMenu = ref(false);

if (!applicationStore.provisioned) {
    await $fetch('/api/database', {
        method: 'POST',
        headers: { 'x-api-key': settingsStore.apiKey },
        body: JSON.stringify(new DatabaseRequest(DatabaseAction.Provision)),
    });

    applicationStore.provisioned = true;
}

applicationStore.showCharacterWindow = false;

onMounted(async () => {
    const updateSettings = async () => {
        openMenu.value = settingsStore.openMenu;
    };

    const updateCharacters = async () => {
        characterCount.value = characterStore.characterCount;
        characters.value = characterStore.characterList;
    };

    const updateApplication = async () => {
        loadingCharacters.value = applicationStore.loadingCharacters;
        showCharacterWindow.value = applicationStore.showCharacterWindow;
    };

    settingsStore.$subscribe(updateSettings);
    characterStore.$subscribe(updateCharacters);
    applicationStore.$subscribe(updateApplication);

    await updateSettings();
    await updateCharacters();
    await updateApplication();
});
</script>

<template>
    <div class="h-full w-full 2xl:overflow-y-hidden">
        <Transition>
            <div v-if="showCharacterWindow" class="absolute backdrop-blur bg-background/50 transition-all w-full h-full inset-0 z-20 p-12 rounded-md overflow-hidden">
                <CharacterWindow />
            </div>
        </Transition>
        <div :class="cn('h-full py-6 lg:px-6 items-stretch gap-6 transition-all 2xl:overflow-hidden', openMenu ? 'character-container openMenu' : 'character-container')">
            <div id="main_content" class="flex flex-col h-full gap-2 order-1 mt-0 border-0 p-0 items-stretch 2xl:overflow-hidden">
                <ControlBar />
                <ScrollArea id="scrollArea" class="w-full h-full overflow-y-hidden rounded-md border">
                    <Transition>
                        <div v-if="loadingCharacters" class="absolute backdrop-blur bg-background/80 transition-all w-full h-full inset-0 z-10 rounded-md flex flex-1 justify-center items-center">
                            <Icon class="w-16 h-16 animate-spin" name="radix-icons:reload" />
                        </div>
                        <div v-else-if="characters.length === 0" class="w-full h-full flex flex-1 flex-col gap-2 justify-center items-center">
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
            <Transition>
                <ControlsPanel v-if="openMenu" class="order-2" />
            </Transition>
        </div>
    </div>
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
    transition: opacity 0.25s ease;
}

.v-enter-from,
.v-leave-to {
    opacity: 0;
}
</style>
