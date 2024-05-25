<script setup lang="ts">
import { Button } from '~/components/ui/button';

const props = defineProps<{
    currJson: string;
    oldJson: string;
}>();

const applicationStore = useApplicationStore();

const modifiedVal = ref(props.currJson);
const originalVal = ref(props.oldJson);

const closeDiffWindow = async () => {
    applicationStore.showDiffWindow = false;
};
</script>

<template>
    <div class="flex gap-2 w-full h-full">
        <div class="flex flex-col gap-2 w-full h-full">
            <div class="flex justify-around w-full">
                <h1 class="font-bold text-2xl">Child</h1>
                <h1 class="font-bold text-2xl">Parent</h1>
            </div>
            <MonacoDiffEditor v-model="modifiedVal" :original="originalVal" lang="json" class="w-full h-full" :options="{ theme: 'vs-dark' }" />
        </div>
        <Button variant="outline" size="icon" @click="closeDiffWindow">
            <Icon name="radix-icons:cross-1" class="w-4 h-4" />
        </Button>
    </div>
</template>

<style scoped></style>
