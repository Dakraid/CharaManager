<script setup lang="ts">
import { useToast } from '~/components/ui/toast';
import { cn } from '~/lib/utils';
import type ApiResponse from '~/models/ApiResponse';
import type { CharacterDetails } from '~/models/CharacterDetails';
import PatchDetailsRequest from '~/models/PatchDetailsRequest';
import StatusCode from '~/models/enums/StatusCode';

const props = defineProps<{
    character: CharacterDetails;
}>();

const { toast } = useToast();

const settingsStore = useSettingsStore();
const characterStore = useCharacterStore();
const applicationStore = useApplicationStore();

const characterInstance = ref<CharacterDetails>();
const showCharacterWindow = ref(false);
const censorChars = ref(false);
const censorNames = ref(false);
const imageContent = ref('');

imageContent.value = characterStore.characterImages.find((x) => x.id === (props.character.id as number))?.content_small ?? '';

const showCharacter = async () => {
    applicationStore.characterInstance = props.character;
    applicationStore.showCharacterWindow = true;
};

const deleteCharacter = async (id: number = -1) => {
    const response = await characterStore.deleteCharacter(id);
    if (response.Status === StatusCode.OK) {
        toast({
            title: response.Message,
            description: response.Content,
        });
    } else {
        toast({
            title: response.Message,
            description: response.Content,
            variant: 'destructive',
        });
    }
};

const downloadCharacter = async (id: number) => {
    const character = await characterStore.getCharacterById(id);
    const response = await $fetch<ApiResponse>('/api/image', {
        method: 'GET',
        headers: { 'x-api-key': settingsStore.apiKey },
        query: { id: id },
    });
    if (response.Status === StatusCode.OK) {
        const anchor = document.createElement('a');
        anchor.href = response.Content.content;
        anchor.download = character?.file_name ?? 'Character.png';
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
    } else {
        toast({
            title: response.Message,
            description: response.Content,
            variant: 'destructive',
        });
    }
};

const updateRating = async (rating: number) => {
    const character = props.character;
    character.rating = rating;
    const response = await $fetch<ApiResponse>('/api/details', {
        method: 'PATCH',
        headers: { 'x-api-key': settingsStore.apiKey },
        body: JSON.stringify(new PatchDetailsRequest(character)),
    });
    if (response.Status === StatusCode.OK) {
        toast({
            title: response.Message,
            description: response.Content,
        });
    } else {
        toast({
            title: response.Message,
            description: response.Content,
            variant: 'destructive',
        });
    }
};

const updateOperationInclude = async (checked: boolean) => {
    if (checked) {
        applicationStore.operationEnabledIds.add(props.character.id as number);
    } else {
        applicationStore.operationEnabledIds.delete(props.character.id as number);
    }
};

onMounted(async () => {
    const updateSettings = async () => {
        censorChars.value = settingsStore.censorChars;
        censorNames.value = settingsStore.censorNames;
    };

    const updateApplication = async () => {
        characterInstance.value = applicationStore.characterInstance;
        showCharacterWindow.value = applicationStore.showCharacterWindow;
    };

    const updateCharacter = async () => {
        imageContent.value = characterStore.characterImages.find((x) => x.id === (props.character.id as number))?.content_small ?? '';
    };

    settingsStore.$subscribe(updateSettings);
    applicationStore.$subscribe(updateApplication);
    characterStore.$subscribe(updateCharacter);

    await updateSettings();
    await updateApplication();
    await updateCharacter();
});
</script>

<template>
    <Card class="flex flex-col items-center w-60 mb-4 transition-all hover:border-accent-foreground hover:shadow-[0_0_20px_-5px] hover:shadow-accent-foreground hover:scale-105 hover:transition-all">
        <CardHeader class="flex flex-col w-full items-center gap-2 flex-1 p-2">
            <CardDescription class="flex w-full justify-between items-center">
                <NuxtRating
                    :read-only="false"
                    :rating-value="character.rating"
                    :rating-count="7"
                    rating-content="◈"
                    active-color="hsl(var(--primary))"
                    inactive-color="hsl(var(--secondary))"
                    rating-size="24px"
                    @rating-selected="updateRating" />
                <Checkbox class="mt-[3px]" @update:checked="updateOperationInclude" />
            </CardDescription>
            <CardTitle>
                <h1 class="font-bold text-center">{{ censorNames ? character.file_name?.replaceAll(/\w/g, '#') : character.file_name }}</h1>
            </CardTitle>
        </CardHeader>
        <CardContent class="w-full p-2 overflow-hidden">
            <img
                :key="character.file_name"
                loading="lazy"
                :alt="character.file_name"
                :src="imageContent"
                :class="cn('character-card rounded-2xl', censorChars ? 'blur-2xl rotate-180 grayscale' : '')"
                @click="showCharacter" />
        </CardContent>
        <CardFooter class="flex flex-col w-full gap-2 p-2">
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
                            <AlertDialogAction @click="deleteCharacter(character.id)">Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </CardFooter>
    </Card>
</template>

<style scoped></style>
