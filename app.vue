<script setup>
const { story } = await useAsyncStoryblok('home', {
  api: { version: 'draft' }
});
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>