<script setup lang="ts"></script>

<template>
    <ScrollArea class="pr-4">
        <Tabs default-value="general" class="flex flex-col h-full w-full max-w-sm py-1px">
            <TabsList class="grid w-full grid-cols-3">
                <TabsTrigger value="general"> General </TabsTrigger>
                <TabsTrigger value="download"> Download </TabsTrigger>
                <TabsTrigger value="operations"> Operations </TabsTrigger>
            </TabsList>
            <TabsContent value="general" class="flex-grow">
                <ControlsGeneralTab />
            </TabsContent>
            <TabsContent value="download">
                <ControlsDownloadTab />
            </TabsContent>
            <TabsContent value="operations">
                <ControlsOperationsTab />
            </TabsContent>
        </Tabs>
    </ScrollArea>
</template>

<style scoped></style>
