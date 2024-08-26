<script setup lang="ts"></script>

<template>
    <Tabs default-value="general" class="flex flex-col h-full w-full mobile-width lg:max-w-sm py-1px mx-auto">
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
</template>

<style scoped></style>
