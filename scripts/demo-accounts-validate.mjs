// Fail-closed Prüfung der Demo-Konten-Datei aus dem Hauptrepo.
// Nur Dateien, die sich ausdrücklich als öffentliche Demo-Daten deklarieren, kommen in die Doku.

const DEMO_DOMAIN = /^demo\.ematchef\.ch$/
const KEY = /^[a-z0-9-]+$/
const TOTP = /^[A-Z2-7]{16,64}$/

export function validateDemoAccounts(raw) {
  const fail = (msg) => {
    throw new Error(`demo-accounts.json abgelehnt: ${msg}`)
  }
  if (!raw || typeof raw !== 'object') fail('kein Objekt')
  if (raw.publicDocumentation !== true) fail('"publicDocumentation": true fehlt (kein Opt-in des Hauptrepos)')
  if (!DEMO_DOMAIN.test(String(raw.domain))) fail(`Domain "${raw.domain}" ist nicht demo.ematchef.ch`)
  if (typeof raw.password !== 'string' || !raw.password) fail('Passwort fehlt')
  if (typeof raw.totpIssuer !== 'string' || !raw.totpIssuer) fail('totpIssuer fehlt')
  if (!Array.isArray(raw.accounts) || raw.accounts.length === 0) fail('accounts leer')
  const seen = new Set()
  for (const a of raw.accounts) {
    if (!KEY.test(String(a.key)) || seen.has(a.key)) fail(`ungültiger/doppelter key "${a.key}"`)
    seen.add(a.key)
    if (a.email !== `${a.key}@${raw.domain}`) fail(`E-Mail "${a.email}" passt nicht zu key "${a.key}" und Demo-Domain`)
    for (const f of ['label', 'role', 'group']) if (typeof a[f] !== 'string' || !a[f]) fail(`${a.key}: ${f} fehlt`)
    if (a.totpSecret !== undefined && !TOTP.test(String(a.totpSecret))) fail(`${a.key}: totpSecret ist kein Base32-Wert`)
  }
  return raw
}
