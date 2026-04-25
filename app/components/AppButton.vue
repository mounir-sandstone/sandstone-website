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

const tag = computed(() => props.to ? resolveComponent('RouterLink') : 'a')
const linkProp = computed(() => props.to ? { to: props.to } : { href: props.href })

const pillClass = computed(() => {
    if (props.variant === 'dark') return 'bg-primary text-white'
    if (props.variant === 'white') return 'bg-white text-primary'
    return 'bg-beige text-primary'
})
const circleStyle = computed(() => {
    if (props.variant === 'dark') return 'background: #CCB395; border-color: rgb(255 255 255 / 20%);'
    if (props.variant === 'white') return 'background: rgb(255 255 255 / 70%); border-color: rgb(255 255 255 / 80%);'
    return 'background: rgb(250 242 229 / 60%); border-color: rgb(255 255 255 / 70%);'
})
const arrowColor = computed(() => props.variant === 'dark' ? '#FAF2E5' : '#22201F')
const primaryHover = computed(() => props.variant === 'dark')
</script>

<template>
    <component :is="tag" v-bind="linkProp"
        :class="['group relative mr-[20px]', full ? 'flex items-center' : 'inline-flex items-center']">
        <!-- Pill -->
        <span :class="[
            pillClass,
            'items-center px-[32px] py-[12px] w-full justify-center rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300 ease-out',
            primaryHover ? 'group-hover:-translate-x-1' : 'hover:opacity-90',
            full ? 'flex flex-1 justify-center' : 'inline-flex',
        ]">
            {{ label }}
        </span>

        <!-- Floating arrow circle -->
        <span
            :class="[
                'absolute top-1/2 right-[-20px] -translate-y-1/2 border w-[43px] h-[43px] rounded-full flex items-center justify-center flex-shrink-0 backdrop-blur-sm transition-all duration-300 ease-out',
                primaryHover ? 'group-hover:right-[calc(100%-32px)]' : '',
            ]"
            :style="circleStyle">

            <svg
                :class="[
                    'transition-transform duration-300 ease-out',
                    primaryHover ? 'group-hover:-scale-x-100' : '',
                ]"
                width="15" height="11" viewBox="0 0 15 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.0132 10.02L14.2574 5.52526C14.3901 5.38526 14.3901 5.16421 14.2574 5.01684L10.0059 0.5"
                    :stroke="arrowColor" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M14.5 5.26001H0.5" :stroke="arrowColor" stroke-miterlimit="10" stroke-linecap="round"
                    stroke-linejoin="round" />
            </svg>

        </span>
    </component>
</template>
