<script lang="ts" setup>
import { cn } from '~/lib/utils';
import type { CharacterDetails } from '~/models/CharacterDetails';
import DatabaseRequest from '~/models/DatabaseRequest';
import { DatabaseAction } from '~/models/enums/DatabaseAction';

const nuxtApp = useNuxtApp();
const settingsStore = useSettingsStore();
const characterStore = useCharacterStore();
const applicationStore = useApplicationStore();

if (!applicationStore.provisioned) {
    await $fetch('/api/database', {
        method: 'POST',
        headers: { 'x-api-key': settingsStore.apiKey },
        body: JSON.stringify(new DatabaseRequest(DatabaseAction.Provision)),
    });

    applicationStore.provisioned = true;
}

await characterStore.getCharacters();

nuxtApp.hooks.hook('refresh:characters', async () => {
    await processCharacters();
});

applicationStore.showCharacterWindow = false;
</script>

<template>
    <div class="h-full w-full 2xl:overflow-y-hidden">
        <Transition>
            <div v-if="applicationStore.showCharacterWindow" class="absolute backdrop-blur bg-background/50 transition-all w-full h-full inset-0 z-20 p-12 rounded-md overflow-hidden">
                <CharacterWindow />
            </div>
        </Transition>
        <div :class="cn('h-full py-6 lg:px-6 items-stretch gap-6 transition-all 2xl:overflow-hidden', !settingsStore.openMenu ? 'character-container openMenu' : 'character-container')">
            <div id="main_content" class="flex flex-col h-full gap-2 order-1 mt-0 border-0 p-0 items-stretch 2xl:overflow-hidden">
                <ControlBar />
                <ScrollArea id="scrollArea" class="w-full h-full overflow-y-hidden rounded-md border">
                    <Transition>
                        <div v-if="characterStore.characterList.length === 0" class="w-full h-full py-16 flex flex-1 flex-col gap-2 justify-center items-center">
                            <h1 class="font-bold text-2xl">No characters found</h1>
                            <Icon class="w-16 h-16" name="radix-icons:question-mark-circled" />
                            <h2 class="font-bold text-xl">Upload characters to see them here</h2>
                        </div>
                        <div v-else class="flex flex-wrap gap-2 justify-between h-full overflow-hidden p-8">
                            <CharacterCard v-for="character in characterStore.characterList" :key="character.id" :character="character" />
                        </div>
                    </Transition>
                </ScrollArea>
            </div>
            <Transition>
                <ControlsPanel v-if="!settingsStore.openMenu" class="order-2" />
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
