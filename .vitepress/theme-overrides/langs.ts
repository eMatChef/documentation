import { computed } from 'vue'
import { useData } from 'vitepress'
import { localizedLink } from '../lang-paths.mjs'

/**
 * Ersatz für vitepress/theme-default composables/langs (per Alias in config.ts).
 * Gleiche API ({ localeLinks, currentLang }), aber Sprachwechsel über die Seitenzuordnung in lang-paths.mjs,
 * weil die Slugs je Sprache unterschiedlich sind.
 */
export function useLangs(_opts: { correspondingLink?: boolean } = {}) {
  const { site, localeIndex, page, hash } = useData()
  const currentLang = computed(() => ({
    label: site.value.locales[localeIndex.value]?.label,
    link: site.value.locales[localeIndex.value]?.link || (localeIndex.value === 'root' ? '/' : `/${localeIndex.value}/`),
  }))
  const localeLinks = computed(() =>
    Object.keys(site.value.locales).flatMap((key) =>
      key === localeIndex.value
        ? []
        : {
            text: site.value.locales[key].label,
            link: localizedLink(localeIndex.value, key, page.value.relativePath) + hash.value,
          },
    ),
  )
  return { localeLinks, currentLang }
}
