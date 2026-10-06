import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import QRCode from 'qrcode'

import { validateDemoAccounts } from '../scripts/demo-accounts-validate.mjs'

/**
 * Demo-/Testkonten für die Testumgebungsseite. Einzige Quelle ist die Seed-Datei des Hauptrepos
 * (backend/data/seeds/dev-demo/demo-accounts.json). `scripts/fetch-demo-accounts.mjs` holt sie vor dem Build
 * nach .demo-data/; ohne diese Datei oder bei Validierungsfehler bricht der Build ab (fail-closed).
 * Login, Secret, otpauth-URI und QR entstehen hier aus derselben Datei. Alles TESTDATEN.
 */
const SOURCE = fileURLToPath(new URL('../.demo-data/demo-accounts.json', import.meta.url))

export type DemoAccount = {
  key: string
  email: string
  label: string
  role: string
  group: string
  totp?: { secret: string; secretGrouped: string; uri: string; qr: string }
}

export type DemoAccountsData = {
  domain: string
  password: string
  accounts: DemoAccount[]
}

declare const data: DemoAccountsData
export { data }

export default {
  watch: [SOURCE],
  async load(): Promise<DemoAccountsData> {
    let raw
    try {
      raw = validateDemoAccounts(JSON.parse(readFileSync(SOURCE, 'utf8')))
    } catch (e) {
      throw new Error(`Demo-Konten nicht verfügbar (npm run demo:fetch ausführen): ${(e as Error).message}`)
    }
    const accounts: DemoAccount[] = []
    for (const a of raw.accounts) {
      const account: DemoAccount = { key: a.key, email: a.email, label: a.label, role: a.role, group: a.group }
      if (a.totpSecret) {
        const issuer = encodeURIComponent(raw.totpIssuer)
        const uri = `otpauth://totp/${issuer}:${encodeURIComponent(a.email)}?secret=${a.totpSecret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`
        account.totp = {
          secret: a.totpSecret,
          secretGrouped: String(a.totpSecret).replace(/(.{4})/g, '$1 ').trim(),
          uri,
          qr: await QRCode.toDataURL(uri, { width: 192, margin: 2 }),
        }
      }
      accounts.push(account)
    }
    return { domain: raw.domain, password: raw.password, accounts }
  },
}
