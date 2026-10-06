#!/usr/bin/env node
// Integritätsprüfung des gebauten Ausgabeordners (Standard: .vitepress/dist).
// Tote interne Links bricht bereits `vitepress build` ab (ignoreDeadLinks ist nicht gesetzt).
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const dist = process.argv[2] || join(root, '.vitepress/dist')
const errors = []

for (const f of ['index.html', 'robots.txt', 'llms.txt', 'de/index.html', 'en/index.html', 'fr/index.html', 'it/index.html', '404.html']) {
  if (!existsSync(join(dist, f))) errors.push(`fehlt: ${f}`)
}

const files = []
const walk = (d) => {
  for (const n of readdirSync(d)) {
    const p = join(d, n)
    statSync(p).isDirectory() ? walk(p) : files.push(p)
  }
}
walk(dist)

// Muster, die nie im öffentlichen Output stehen dürfen.
const forbidden = [
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'privater Schlüssel'],
  [/MAILER_DSN\s*=\s*\S+:\/\/\S+:\S+@/, 'MAILER_DSN mit Zugangsdaten'],
  [/\b(smtp|smtps):\/\/[^\s"'<>:@]+:[^\s"'<>@]+@/, 'SMTP-URL mit Zugangsdaten'],
  [/\bgh[pousr]_[A-Za-z0-9]{20,}/, 'GitHub-Token'],
  [/\bAKIA[0-9A-Z]{16}\b/, 'AWS-Access-Key'],
]
for (const f of files.filter((p) => /\.(html|js|json|txt|xml|md)$/.test(p))) {
  const text = readFileSync(f, 'utf8')
  for (const [re, what] of forbidden) if (re.test(text)) errors.push(`${what} in ${f.slice(dist.length + 1)}`)
}

// Nur Seeds aus der validierten Demo-Quelle: jedes otpauth-Secret im Output muss dort vorkommen.
const demoFile = join(root, '.demo-data/demo-accounts.json')
if (!existsSync(demoFile)) errors.push('.demo-data/demo-accounts.json fehlt')
else {
  const allowed = new Set(JSON.parse(readFileSync(demoFile, 'utf8')).accounts.map((a) => a.totpSecret).filter(Boolean))
  for (const f of files.filter((p) => p.endsWith('.html'))) {
    for (const m of readFileSync(f, 'utf8').matchAll(/secret=([A-Z2-7]{16,})/g)) {
      if (!allowed.has(m[1])) errors.push(`fremdes TOTP-Secret in ${f.slice(dist.length + 1)}`)
    }
  }
}

// Interne Links (href="/…") müssen auf vorhandene Dateien zeigen; deckt auch den Sprachumschalter ab.
const exists = (url) => {
  const p = decodeURIComponent(url.split('#')[0].split('?')[0]).replace(/\/$/, '')
  return [p, `${p}.html`, `${p}/index.html`].some((c) => c !== '' && existsSync(join(dist, c)) && statSync(join(dist, c)).isFile()) || p === ''
}
for (const f of files.filter((p) => p.endsWith('.html'))) {
  for (const m of readFileSync(f, 'utf8').matchAll(/href="(\/[^"]*)"/g)) {
    if (m[1].startsWith('//') || m[1].startsWith('/assets/')) continue
    if (!exists(m[1])) errors.push(`toter interner Link ${m[1]} in ${f.slice(dist.length + 1)}`)
  }
}

// Jede lokalisierte Seite muss in .vitepress/lang-paths.mjs zugeordnet sein.
const { LANGS, PAGE_GROUPS } = await import('../.vitepress/lang-paths.mjs')
for (const g of PAGE_GROUPS) {
  for (const l of LANGS) if (!g[l] || !existsSync(join(root, l, `${g[l]}.md`))) errors.push(`lang-paths: ${l}/${g[l]}.md fehlt`)
}
for (const l of LANGS) {
  const mapped = new Set(PAGE_GROUPS.map((g) => g[l]))
  const walkMd = (d, rel = '') => readdirSync(d).flatMap((n) => {
    const p = join(d, n)
    return statSync(p).isDirectory() ? walkMd(p, `${rel}${n}/`) : n.endsWith('.md') ? [`${rel}${n.slice(0, -3)}`] : []
  })
  for (const page of walkMd(join(root, l))) if (page !== 'index' && !mapped.has(page)) errors.push(`lang-paths: ${l}/${page}.md ist keiner Gruppe zugeordnet`)
}

// Testumgebung bleibt aus der Sitemap.
const sitemap = existsSync(join(dist, 'sitemap.xml')) ? readFileSync(join(dist, 'sitemap.xml'), 'utf8') : ''
if (!sitemap) errors.push('sitemap.xml fehlt')
if (/\/(entwicklung|development|developpement|sviluppo)\//.test(sitemap)) errors.push('Entwicklungsseiten in sitemap.xml')

if (errors.length) {
  console.error('Integritätsprüfung fehlgeschlagen:\n- ' + errors.join('\n- '))
  process.exit(1)
}
console.log(`Integritätsprüfung OK (${files.length} Dateien in ${dist})`)
