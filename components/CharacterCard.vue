<script setup lang="ts">
import { cn } from '~/lib/utils';
import { useApplicationStore } from '~/stores/applicationStore';
import { useToast } from '~/components/ui/toast';
import { useCharacterStore } from '~/stores/characterStore';
import type { Character } from '~/models/Character';

const props = defineProps<{
    character: Character;
}>();

const { toast } = useToast();

const characterStore = useCharacterStore();

const applicationStore = useApplicationStore();
const censorChars = ref(false);
const censorNames = ref(false);
const characterInstance = ref<Character>();
const showCharacterWindow = ref(false);

const updateApplication = async () => {
    censorChars.value = applicationStore.censorChars;
    censorNames.value = applicationStore.censorNames;
    characterInstance.value = applicationStore.characterInstance;
    showCharacterWindow.value = applicationStore.showCharacterWindow;
};

applicationStore.$subscribe(updateApplication);

const showCharacter = async () => {
    applicationStore.characterInstance = props.character;
    applicationStore.showCharacterWindow = true;
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

const downloadCharacter = async (id: number) => {
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
</script>

<template>
    <Card class="flex flex-col items-center w-60">
        <CardHeader class="flex flex-col gap-4 flex-1 px-2 py-2">
            <CardTitle class="font-bold text-center">
                {{ censorNames ? character.file_name?.replaceAll(/\w/g, '#') : character.file_name }}
            </CardTitle>
        </CardHeader>
        <CardContent class="w-full px-2 py-2 overflow-hidden">
            <img
                :key="character.file_name"
                :alt="character.file_name"
                :src="character.image_content"
                :class="cn('character-card rounded-2xl', censorChars ? 'blur-2xl rotate-180 grayscale' : '')"
                @click="showCharacter" />
        </CardContent>
        <CardFooter class="flex flex-col w-full gap-2 px-2 py-2">
            <div class="flex w-full gap-4">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger as-child>
                            <Button type="submit" variant="outline" class="flex justify-center items-center px-2" @click="downloadCharacter(<number>character.id)">
                                <span class="sr-only">Download File</span>
                                <Icon class="h-5 w-5 m-0.5" name="radix-icons:download" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Download Character</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <span class="flex-1 text-sm text-center opacity-50 whitespace-break-spaces">{{ character.formatted_timestamp }}</span>
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
                            <AlertDialogDescription> This action cannot be undone. This will permanently delete your character and remove your data from the database. </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction @click="deleteCharacter(character.id, false)">Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </CardFooter>
    </Card>
</template>

<style scoped></style>
