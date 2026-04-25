<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue'
import { FreeMode, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/free-mode'

defineProps({ blok: Object })

const modules = [FreeMode, Autoplay]

// Soft pill colours for category tags
const tagColours = {
    AI: 'bg-violet-600/80 text-white',
    Brand: 'bg-amber-500/80 text-white',
    Design: 'bg-pink-600/80 text-white',
    Strategy: 'bg-sky-600/80 text-white',
    Tech: 'bg-emerald-600/80 text-white',
}
function tagStyle(t) {
    return tagColours[t] ?? 'bg-white/20 text-white'
}
</script>

<template>
    <section v-editable="blok" class="bg-white overflow-hidden">

        <!-- Header -->
        <div class="max-w-[var(--width-container)] mx-auto px-[20px] 2xl:px-0 pt-24 pb-[64px]">
            <span
                class="inline-flex items-center px-[24px] py-[10px] rounded-full border border-primary text-primary text-ui font-regular mb-5">
                {{ blok.tag || 'Insights' }}
            </span>
            <h2 class="text-[32px] sm:text-h2  leading-[1.2] font-semibold text-primary mb-[16px]">
                {{ blok.heading || 'Thoughts in progress' }}
            </h2>
            <p class="text-primary text-body font-medium leading-relaxed">
                {{ blok.description }}
            </p>
        </div>

        <!-- Full-bleed card slider -->
        <div class="w-full pb-20">
            <ClientOnly>
                <Swiper :modules="modules" slides-per-view="auto" :space-between="16"
                    :free-mode="{ enabled: true, momentum: true }"
                    :autoplay="{ delay: 3500, disableOnInteraction: false, pauseOnMouseEnter: true }" :loop="true"
                    :grab-cursor="true" class="!overflow-visible insights-swiper">
                    <SwiperSlide v-for="post in blok.posts" :key="post._uid" class="w-[300px] sm:!w-[416px]">
                        <NuxtLink :to="post.link?.cached_url || post.link?.url || '#'"
                            class="group relative flex flex-col rounded-[8px] overflow-hidden h-[616px] bg-primary cursor-pointer block">
                            <!-- Background image -->
                            <div class="absolute inset-0">
                                <img v-if="post.image?.filename" :src="post.image.filename + '/m/600x760/smart'"
                                    :alt="post.title"
                                    class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    draggable="false" />
                                <!-- Fallback gradient -->
                                <div v-else class="w-full h-full bg-gradient-to-br from-primary/80 to-primary/40" />
                                <!-- Dark vignette — stronger at bottom -->
                                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />
                            </div>

                            <!-- Top row: tags + arrow -->
                            <div class="relative z-10 flex items-start justify-between gap-2 pt-[36px] px-[32px]">
                                <div class="flex items-center gap-1.5 flex-wrap">
                                    <span v-for="tag in post.tags" :key="tag"
                                        class="inline-flex items-center px-[14px] py-[8px] rounded-full text-[14px] font-regular bg-white/10 backdrop-blur-sm border border-white/50"
                                        :class="tagStyle(tag)">{{ tag }}</span>
                                </div>
                                <!-- Arrow button -->
                                <div
                                    class="flex-shrink-0 w-[42px] h-[42px] rounded-full border border-white/30 bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/25 transition-colors duration-200">

                                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M5.76521 11.5357L11.0618 11.3838C11.2271 11.3794 11.361 11.2454 11.37 11.0757L11.5307 5.76123"
                                            stroke="#FFFCF6" stroke-miterlimit="10" stroke-linecap="round"
                                            stroke-linejoin="round" />
                                        <path d="M11.3705 11.37L2.88523 2.88477" stroke="#FFFCF6" stroke-miterlimit="10"
                                            stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>

                                </div>
                            </div>

                            <!-- Bottom text -->
                            <div class="relative z-10 mt-auto p-[32px]">
                                <!-- Date + read time -->
                                <div class="flex items-center gap-2 mb-[16px] text-white text-ui font-regular">
                                    <span>{{ post.date }}</span>
                                    <span>—</span>
                                    <span>{{ post.read_time }}</span>
                                </div>
                                <!-- Title -->
                                <h3 class="text-white text-body sm:text-h3 font-semibold leading-snug line-clamp-3">{{
                                    post.title }}
                                </h3>
                            </div>
                        </NuxtLink>
                    </SwiperSlide>
                </Swiper>

                <template #fallback>
                    <div class="flex gap-3 px-8">
                        <div v-for="i in 4" :key="i"
                            class="w-[270px] h-[380px] rounded-[16px] bg-primary/10 flex-shrink-0 animate-pulse" />
                    </div>
                </template>
            </ClientOnly>
        </div>

        <!-- CTA row -->
        <div
            class="max-w-[var(--width-container)] mx-auto px-[20px] 2xl:px-0 flex flex-col lg:flex-row lg:justify-end  mb-[324px]">
            <AppButton :label="blok.cta_label || 'Explore everything we publish'"
                :to="blok.cta_link?.cached_url || blok.cta_link?.url" variant="dark" :full="true" />
        </div>

    </section>
</template>

<style scoped>
.insights-swiper {
    padding-left: max(2rem, calc((100vw - var(--width-container, 1280px)) / 2 + 2rem));
    padding-right: 2rem;
}
</style>
