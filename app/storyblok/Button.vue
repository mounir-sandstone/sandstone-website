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
    class="group relative inline-flex items-center justify-center gap-2 px-[24px] py-[12px] rounded-full text-ui font-semibold border border-white text-white overflow-hidden backdrop-blur-sm transition-all duration-300 ease-out hover:border-[#CCB395]/90 hover:shadow-[0_10px_28px_rgba(23,57,85,0.22)] hover:-translate-y-[1px]"
    style="background: rgb(250 242 229 / 0%); border-inline: none;">
    <span
      class="absolute inset-0 bg-gradient-to-r from-[#CCB395]/28 via-white/12 to-[#CCB395]/22 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100" />
    <span class="relative z-[1] transition-colors duration-300 group-hover:text-[#F8F3EA]">
      {{ blok.label }}
    </span>
  </a>
</template>
