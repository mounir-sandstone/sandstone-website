<!-- components/NavItem.vue -->
<script setup>
defineProps({
  blok: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <NuxtLink v-editable="blok" :to="'/' + (blok.Link?.cached_url ?? blok.Link?.url ?? '').replace(/^\//, '')"
    class="px-[24px] py-[12px] rounded-full text-ui font-semibold backdrop-filter backdrop-blur-sm bg-opacity-30 text-white border border-white backdrop-blur-md hover:bg-white/[0.1] hover:border-white/[0.2] transition-all duration-200 inset-shadow-[inset_0px_0px_44px_-5px_#ffffff]"
    style="border-inline:none" active-class="">
    {{ blok.Label }}
  </NuxtLink>
</template>