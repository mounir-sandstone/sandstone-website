<script setup>
const storyblokApi = useStoryblokApi()
const { data: story } = await useAsyncData('story-home', async () => {
  const { data } = await storyblokApi.get('cdn/stories/home', { version: 'draft' })
  return data.story
})
</script>

<template>
  <StoryblokComponent v-if="story" :blok="story.content" />
</template>