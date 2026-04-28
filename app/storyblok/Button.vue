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
    class="group relative inline-flex items-center justify-center gap-2 px-[24px] py-[12px] rounded-full text-ui font-semibold border border-white/75 text-white overflow-hidden backdrop-blur-sm transition-all duration-300 ease-out hover:border-[#CCB395] hover:shadow-[0_14px_34px_rgba(23,57,85,0.3)] hover:-translate-y-[2px] hover:text-[#FFFCF6]"
    style="background: rgb(250 242 229 / 0%); border-inline: none;">
    <span
      class="absolute inset-0 bg-gradient-to-r from-[#CCB395]/38 via-white/20 to-[#CCB395]/30 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100" />
    <span
      class="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/0 transition duration-300 ease-out group-hover:ring-white/40" />
    <span class="relative z-[1] transition-colors duration-300 group-hover:text-[#FFFCF6]">
      {{ blok.label }}
    </span>
  </a>
</template>
