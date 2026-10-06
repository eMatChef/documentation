// Gleichwertige Seiten je Sprache (Pfad ohne Sprachpräfix und ohne .md).
// Die Slugs sind pro Sprache lokalisiert; der Sprachumschalter nutzt diese Zuordnung statt nur das Präfix zu tauschen.
// Neue Seite mit lokalisierten Slugs: hier eine Zeile ergänzen (scripts/check-build.mjs prüft Vollständigkeit).
export const LANGS = ['de', 'en', 'fr', 'it']

export const PAGE_GROUPS = [
  { de: 'hilfe/tours-und-hilfe', en: 'help/tours-and-help', fr: 'aide/visites-et-aide', it: 'aiuto/tour-e-guida' },
  { de: 'hilfe/aktivitaet-anlegen', en: 'help/create-activity', fr: 'aide/creer-une-activite', it: 'aiuto/crea-attivita' },
  { de: 'hilfe/externe-ausleihe', en: 'help/external-loan', fr: 'aide/pret-externe', it: 'aiuto/prestito-esterno' },
  { de: 'entwicklung/testumgebung', en: 'development/test-environment', fr: 'developpement/environnement-de-test', it: 'sviluppo/ambiente-di-test' },
]

/**
 * Ziel-URL der aktuellen Seite in einer anderen Sprache.
 * @param {string} from  aktuelle Sprache
 * @param {string} to    Zielsprache
 * @param {string} relativePath page.relativePath, z. B. "de/entwicklung/testumgebung.md"
 * Ohne Zuordnung: Startseite der Zielsprache (nie eine nicht existierende URL).
 */
export function localizedLink(from, to, relativePath) {
  const path = relativePath.replace(/^[^/]+\//, '').replace(/\.md$/, '').replace(/(^|\/)index$/, '$1')
  if (path === '') return `/${to}/`
  const group = PAGE_GROUPS.find((g) => g[from] === path)
  return group ? `/${to}/${group[to]}` : `/${to}/`
}
