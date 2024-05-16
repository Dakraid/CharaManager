<script setup lang="ts">
import {Button} from "~/components/ui/button";
import {useApplicationStore} from "~/stores/applicationStore";

const props = defineProps<{
    currJson: string;
    oldJson: string;
}>();

const applicationStore = useApplicationStore();

const modifiedVal = ref(props.currJson);
const originalVal = ref(props.oldJson);

const closeDiffWindow = async () => {
    applicationStore.showDiffWindow = false;
}
</script>

<template>
    <div class="flex gap-2 w-full h-full">
        <MonacoDiffEditor v-model="modifiedVal" :original="originalVal" lang="json" class="w-full h-full" :options="{ theme: 'vs-dark' }"/>
        <Button variant="outline" size="icon" @click="closeDiffWindow">
            <Icon name="radix-icons:cross-1" class="w-4 h-4" />
        </Button>
    </div>
</template>

<style scoped></style>
