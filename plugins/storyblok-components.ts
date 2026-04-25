/**
 * Storyblok components are auto-registered globally by @storyblok/nuxt
 * via the `componentsDir` option in nuxt.config.ts.
 *
 * Components whose Storyblok block type contains underscores (e.g. nav_item)
 * must be registered manually here because Vue only normalises kebab-case →
 * PascalCase automatically, not snake_case → PascalCase.
 */
import NavItem from '~/app/storyblok/NavItem.vue'

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.component('nav_item', NavItem)
})
