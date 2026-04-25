<script setup>
defineProps({
  blok: Object
})
</script>

<template>
  <!-- Primary — uses the branded beige pill + floating arrow circle -->
  <AppButton v-if="blok.style === 'Primary'" v-editable="blok" :label="blok.label"
    :href="blok.link?.url || blok.link?.cached_url || '#'" />

  <!-- Secondary — ghost outlined pill -->
  <a v-else v-editable="blok" :href="blok.link?.url || blok.link?.cached_url || '#'"
    class="inline-flex items-center justify-center gap-2 px-[24px] py-[12px] rounded-full text-ui font-semibold border border-white text-white hover:border-white/50 hover:bg-white/5 transition-all duration-200 backdrop-blur-sm"
    style="background: rgb(250 242 229 / 0%);border-inline:none;">
    {{ blok.label }}
  </a>
</template>