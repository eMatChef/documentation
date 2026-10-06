#!/usr/bin/env node
// Holt demo-accounts.json aus dem Hauptrepo (Source of Truth) nach .demo-data/.
//
// - Ref steht in demo-source.json (Branch, kein hartcodierter SHA); aufgelöst wird per `git ls-remote`
//   auf einen konkreten Commit, der in .demo-data/source.json protokolliert wird (Reproduzierbarkeit).
// - Fail-closed: jeder Fehler (Ref/Datei fehlt, Netzwerk, Validierung) bricht mit Exit 1 ab.
//   Es gibt keinen Cache- oder Fallback-Pfad.
// - Lokal: DEMO_ACCOUNTS_FILE=/pfad/zu/demo-accounts.json nutzt eine lokale Datei (in CI verboten).
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { validateDemoAccounts } from './demo-accounts-validate.mjs'

const root = fileURLToPath(new URL('..', import.meta.url))
const outDir = `${root}.demo-data`
const source = JSON.parse(readFileSync(`${root}demo-source.json`, 'utf8'))

try {
  rmSync(outDir, { recursive: true, force: true })
  mkdirSync(outDir, { recursive: true })
  let text
  let meta
  if (process.env.DEMO_ACCOUNTS_FILE) {
    if (process.env.CI) throw new Error('DEMO_ACCOUNTS_FILE ist in CI nicht erlaubt')
    text = readFileSync(process.env.DEMO_ACCOUNTS_FILE, 'utf8')
    meta = { origin: 'local-file', file: process.env.DEMO_ACCOUNTS_FILE }
  } else {
    const ref = process.env.DEMO_SOURCE_REF || source.ref
    const out = execFileSync('git', ['ls-remote', source.repo, `refs/heads/${ref}`, `refs/tags/${ref}`], { encoding: 'utf8' })
    const sha = out.split('\n').find(Boolean)?.split(/\s+/)[0]
    if (!sha || !/^[0-9a-f]{40}$/.test(sha)) throw new Error(`Ref "${ref}" in ${source.repo} nicht auflösbar`)
    const slug = source.repo.replace(/^https:\/\/github\.com\//, '').replace(/\.git$/, '')
    const url = `https://raw.githubusercontent.com/${slug}/${sha}/${source.path}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Download fehlgeschlagen (${res.status}): ${url}`)
    text = await res.text()
    meta = { origin: source.repo, ref, sha, path: source.path }
  }
  validateDemoAccounts(JSON.parse(text))
  writeFileSync(`${outDir}/demo-accounts.json`, text)
  writeFileSync(`${outDir}/source.json`, JSON.stringify({ ...meta, fetchedAt: new Date().toISOString() }, null, 2) + '\n')
  console.log(`Demo-Konten übernommen: ${JSON.stringify(meta)}`)
} catch (e) {
  rmSync(outDir, { recursive: true, force: true })
  console.error(`FEHLER Demo-Daten-Import: ${e.message}\nBuild abgebrochen (fail-closed), es werden keine Demo-Zugangsdaten veröffentlicht.`)
  process.exit(1)
}
