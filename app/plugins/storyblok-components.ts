/**
 * Storyblok components are auto-registered globally by @storyblok/nuxt
 * via the `componentsDir` option in nuxt.config.ts.
 *
 * Components whose Storyblok block type contains underscores (e.g. nav_item)
 * must be registered manually here because Vue only normalises kebab-case →
 * PascalCase automatically, not snake_case → PascalCase.
 */
import NavItem from '~/storyblok/NavItem.vue'
import GlobalPresence from '~/storyblok/GlobalPresence.vue'
import OurImpact from '~/storyblok/OurImpact.vue'
import TrustedBy from '~/storyblok/TrustedBy.vue'
import SelectedWork from '~/storyblok/SelectedWork.vue'
import OurServices from '~/storyblok/OurServices.vue'
import OurApproach from '~/storyblok/OurApproach.vue'
import OurInsights from '~/storyblok/OurInsights.vue'
import CallToAction from '~/storyblok/CallToAction.vue'

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.component('nav_item', NavItem)
    nuxtApp.vueApp.component('global_presence', GlobalPresence)
    nuxtApp.vueApp.component('our_impact', OurImpact)
    nuxtApp.vueApp.component('trusted_by', TrustedBy)
    nuxtApp.vueApp.component('selected_work', SelectedWork)
    nuxtApp.vueApp.component('our_services', OurServices)
    nuxtApp.vueApp.component('our_approach', OurApproach)
    nuxtApp.vueApp.component('our_insights', OurInsights)
    nuxtApp.vueApp.component('call_to_action', CallToAction)
})
