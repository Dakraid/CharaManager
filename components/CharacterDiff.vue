<script setup lang="ts">
import { Button } from '~/components/ui/button';

const props = defineProps<{
    currJson: string;
    oldJson: string;
}>();

const loading = ref(true);

const applicationStore = useApplicationStore();

const modifiedVal = ref(props.currJson);
const originalVal = ref(props.oldJson);

const closeDiffWindow = async () => {
    applicationStore.showDiffWindow = false;
};

loading.value = false;
</script>

<template>
    <Button variant="outline" size="icon" class="absolute w-11 h-11 top-16 right-16 z-10" @click="closeDiffWindow">
        <Icon name="radix-icons:cross-1" class="w-4 h-4" />
    </Button>
    <Skeleton v-if="loading" class="h-full w-full" />
    <Transition>
        <div v-if="!loading" class="flex flex-col gap-2 w-full h-full px-2 rounded-md border border-muted">
            <div class="flex justify-around w-full py-4">
                <h1 class="font-bold text-2xl">Child</h1>
                <h1 class="font-bold text-2xl">Parent</h1>
            </div>
            <MonacoDiffEditor v-model="modifiedVal" :original="originalVal" lang="json" class="w-full h-full" :options="{ theme: 'vs-dark' }" />
        </div>
    </Transition>
</template>

<style scoped></style>
