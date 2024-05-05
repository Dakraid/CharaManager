<script lang="ts" setup>
import '~/assets/css/style.css';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast/use-toast';
import { Toaster } from '@/components/ui/toast';
import { cn } from '~/lib/utils';
import { useCharacterStore } from '~/stores/characterStore';
import { useApplicationStore } from '~/stores/applicationStore';
import type {CharacterCard} from "~/models/CharacterCard";

const { toast } = useToast();

const characterStore = useCharacterStore();
const characters = ref();
const characterCount = ref(0);

const updateCharacters = async () => {
    characterCount.value = characterStore.characterCount;
    characters.value = characterStore.characterList;
};

characterStore.$subscribe(updateCharacters);

const applicationStore = useApplicationStore();
const processing = ref(true);
const censorChars = ref(false);
const censorNames = ref(false);

const updateApplication = async () => {
    processing.value = applicationStore.processing;
    censorChars.value = applicationStore.censorChars;
    censorNames.value = applicationStore.censorNames;
};

applicationStore.$subscribe(updateApplication);

const getCharacters = async () => {
    await characterStore.loadCharacters();
};

const deleteCharacter = async (id: number = -1, purge: boolean = false) => {
    applicationStore.deleteOptions = { id: id, purge: purge };
    const response = await characterStore.deleteCharacter();
    if (response?.status === 200) {
        toast({
            title: 'Character(s) have been deleted',
            description: response.message,
        });
    } else {
        toast({
            title: "Character(s) couldn't be deleted",
            description: response?.message,
            variant: 'destructive',
        });
    }
};

const downloadImage = async (id: number) => {
    const character = await characterStore.getCharacterById(id);
    if (character === undefined || character.image_content === undefined) {
        toast({
            title: 'Failed to download image.',
            variant: 'destructive',
        });
        return;
    }
    const anchor = document.createElement('a');
    anchor.href = character.image_content;
    anchor.download = character.file_name ?? 'Character.png';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
};

const showCharacterWindow = ref(false)
const character = ref()

const getData = async (characterIn: CharacterCard) => {
    character.value = characterIn;
    showCharacterWindow.value = true;
};

const closeCharacterWindow = async () => {
    character.value = null;
    showCharacterWindow.value = false;
}
</script>

<template>
    <Toaster />
    <div class="h-screen flex flex-col overflow-y-hidden">
        <TopBar />
        <Separator />
        <div class="grid h-full overflow-y-hidden py-6 lg:px-24 items-stretch gap-6 md:grid-cols-[minmax(0,1fr)_300px]">
            <SideBar @update-characters="getCharacters" />
            <div id="main_content" class="flex flex-col h-full overflow-y-hidden gap-2 md:order-1 mt-0 border-0 p-0">
                <ControlBar @update-characters="getCharacters" />
                <ScrollArea id="scrollArea" class="w-full h-full overflow-y-hidden rounded-md border p-4 pr-6">
                    <div v-if="processing" class="absolute backdrop-blur bg-background/80 transition-all w-full h-full inset-0 z-10 rounded-md flex flex-1 justify-center items-center">
                        <Icon class="w-16 h-16 animate-spin" name="radix-icons:reload" />
                    </div>
                    <div v-if="showCharacterWindow" class="absolute backdrop-blur bg-background/80 transition-all w-full h-full inset-0 z-10 p-16 rounded-md flex flex-1 justify-center items-center">
                        <CharacterDetails :character="character" @close-character="closeCharacterWindow"/>
                    </div>
                    <div v-if="characters === undefined || characters.length === 0" class="flex flex-1 flex-col gap-2 justify-center items-center">
                        <h1 class="font-bold text-2xl">No characters found</h1>
                        <Icon class="w-16 h-16" name="radix-icons:question-mark-circled" />
                        <h2 class="font-bold text-xl">Upload characters to see them here</h2>
                    </div>
                    <div v-else class="flex flex-wrap gap-2 justify-between h-full overflow-hidden">
                        <Card v-for="character in characters" class="flex flex-col items-center w-60">
                            <CardHeader class="flex-1 p-4">
                                <CardTitle class="font-bold text-center">
                                    {{ censorNames ? character.file_name?.replaceAll(/\w/g, '#') : character.file_name }}
                                </CardTitle>
                            </CardHeader>
                            <CardContent class="w-full p-2 pt-0 overflow-hidden">
                                <img
                                    :key="character.file_name"
                                    :alt="character.file_name"
                                    :src="character.image_content"
                                    :class="cn('character-card rounded-2xl', censorChars ? 'blur-xl grayscale' : '')"
                                    @click="getData(character)" />
                            </CardContent>
                            <CardFooter class="flex w-full gap-2 p-4 pt-0">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger as-child>
                                            <Button type="submit" variant="outline" class="flex justify-center items-center px-2" @click="downloadImage(<number>character.id)">
                                                <span class="sr-only">Download File</span>
                                                <Icon class="h-5 w-5 m-0.5" name="radix-icons:download" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Download Character</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                <span class="flex-1 text-sm text-center opacity-50">{{ character.formatted_timestamp }}</span>
                                <AlertDialog>
                                    <AlertDialogTrigger as-child>
                                        <Button type="submit" variant="destructive" class="flex justify-center items-center px-2">
                                            <span class="sr-only">Delete Character</span>
                                            <Icon class="h-5 w-5 m-0.5" name="radix-icons:trash" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete your character and remove your data from the database.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction @click="deleteCharacter(character.id, false)">Continue</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </CardFooter>
                        </Card>
                    </div>
                </ScrollArea>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
