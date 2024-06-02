<script setup lang="ts">
import _ from 'lodash';
import { cn } from '~/lib/utils';
import type ApiResponse from '~/models/ApiResponse';

const settingsStore = useSettingsStore();

const response = await $fetch<ApiResponse>('/api/logs', {
    method: 'GET',
    headers: { 'x-api-key': settingsStore.apiKey },
});

const logs = ref();
logs.value = [];

try {
    for (const line of response.Content.appLog.split('\n')) {
        if (line.trim().length < 1) {
            continue;
        }
        logs.value.push(JSON.parse(line));
    }
} catch (e) {
    console.log(e);
}

try {
    for (const line of response.Content.serverLog.split('\n')) {
        if (line.trim().length < 1) {
            continue;
        }
        logs.value.push(JSON.parse(line));
    }
} catch (e) {
    console.log(e);
}

try {
    for (const line of response.Content.serverErrorLog.split('\n')) {
        if (line.trim().length < 1) {
            continue;
        }
        logs.value.push(JSON.parse(line));
    }
} catch (e) {
    console.log(e);
}

logs.value = _.sortBy(logs.value, 'timestamp');
logs.value = _.reverse(logs.value);
</script>

<template>
    <div class="flex-col h-full overflow-y-hidden py-6 lg:px-24 items-stretch">
        <ScrollArea class="w-full h-full overflow-scroll rounded-md border p-4 pr-6">
            <Table class="w-full h-full">
                <TableHeader>
                    <TableRow>
                        <TableHead class="w-[150px] text-center"> Timestamp </TableHead>
                        <TableHead class="w-[150px] text-center"> Level </TableHead>
                        <TableHead class="text-center"> Message </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow v-for="log in logs" :key="log.message">
                        <TableCell class="text-center">
                            {{ $dayjs(log.timestamp).toString() }}
                        </TableCell>
                        <TableCell :class="cn('text-center font-bold', log.level === 'error' ? 'bg-rose-500' : log.level === 'warn' ? 'bg-yellow-500' : log.level === 'info' ? 'bg-green-500' : '')">
                            {{ _.upperFirst(log.level) }}
                        </TableCell>
                        <TableCell>
                            {{ log.message }}
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </ScrollArea>
    </div>
</template>

<style scoped></style>
