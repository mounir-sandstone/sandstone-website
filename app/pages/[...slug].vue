<script setup>
const route = useRoute()
const slug = Array.isArray(route.params.slug) && route.params.slug.length > 0
  ? route.params.slug.join('/')
  : 'home'

const storyblokApi = useStoryblokApi()
const { data: story } = await useAsyncData(`story-${slug}`, async () => {
  const { data } = await storyblokApi.get(`cdn/stories/${slug}`, { version: 'draft' })
  return data.story
})
</script>

<template>
  <StoryblokComponent v-if="story" :blok="story.content" />
</template>