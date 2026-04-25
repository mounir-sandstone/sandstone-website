<script setup>
const props = defineProps({
  label: { type: String, required: true },
  to: { type: String, default: null },
  href: { type: String, default: '#' },
  full: { type: Boolean, default: false },
  // 'light' = beige pill (default, on dark bgs)
  // 'dark'  = primary/navy pill (on light/cream bgs)
  // 'white' = pure white pill (on dark bgs, e.g. CTA section)
  variant: { type: String, default: 'light' },
})

const tag = computed(() => (props.to ? resolveComponent('RouterLink') : 'a'))
const linkProp = computed(() => (props.to ? { to: props.to } : { href: props.href }))

const pillClass = computed(() => {
  if (props.variant === 'dark') return 'bg-primary text-white border-primary/35'
  if (props.variant === 'white') return 'bg-white text-primary border-white/70'
  return 'bg-beige text-primary border-white/60'
})

const hoverOverlayClass = computed(() => {
  if (props.variant === 'dark') return 'bg-white/16'
  if (props.variant === 'white') return 'bg-primary/12'
  return 'bg-white/35'
})

const circleClass = computed(() => {
  if (props.variant === 'dark') return 'bg-[#CCB395] border-white/20 text-primary'
  if (props.variant === 'white') return 'bg-[#ECE7DF] border-white/80 text-primary'
  return 'bg-[#F6E9D6] border-white/70 text-primary'
})

const arrowStroke = computed(() => (props.variant === 'dark' ? '#173955' : '#22201F'))
</script>

<template>
  <component
    :is="tag"
    v-bind="linkProp"
    :class="[
      'group relative mr-[20px] select-none',
      full ? 'flex items-center w-full' : 'inline-flex items-center',
    ]"
  >
    <span
      :class="[
        pillClass,
        'relative overflow-hidden border backdrop-blur-[1px] rounded-full px-[32px] py-[12px] text-sm font-semibold whitespace-nowrap transition-all duration-500 ease-out',
        'group-hover:shadow-[0_10px_30px_rgba(23,57,85,0.22)] group-hover:-translate-y-[1px]',
        full ? 'flex w-full justify-center' : 'inline-flex',
      ]"
    >
      <span
        :class="[
          hoverOverlayClass,
          'absolute inset-0 rounded-full origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100',
        ]"
      />
      <span class="relative z-[1] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-[2px]">
        {{ label }}
      </span>
    </span>

    <span
      :class="[
        circleClass,
        'absolute top-1/2 right-[-20px] -translate-y-1/2 rounded-full border w-[43px] h-[43px] flex items-center justify-center flex-shrink-0',
        'transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:right-[calc(100%-40px)] group-hover:scale-105 group-hover:rotate-[-12deg]',
      ]"
    >
      <svg
        class="transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-[1px]"
        width="15"
        height="11"
        viewBox="0 0 15 11"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10.0132 10.02L14.2574 5.52526C14.3901 5.38526 14.3901 5.16421 14.2574 5.01684L10.0059 0.5"
          :stroke="arrowStroke"
          stroke-miterlimit="10"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M14.5 5.26001H0.5"
          :stroke="arrowStroke"
          stroke-miterlimit="10"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </span>
  </component>
</template>
