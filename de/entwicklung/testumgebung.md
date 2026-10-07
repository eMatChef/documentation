---
title: Testumgebung
description: Umgebungen, Demo-Konten, Test-TOTP und Test-Mails für Entwicklung und Staging von eMatChef.
head:
  - - meta
    - name: robots
      content: noindex, nofollow
---

<script setup>
import { data } from '../../.vitepress/demo-accounts.data.ts'
const groups = {"global": "Global", "department": "Department", "grossanlass": "Grossanlass", "supplier": "Lieferant"}
const withTotp = data.accounts.filter((a) => a.totp)
const displayEmail = (email) => email.replace('@', ' ( a ) ')
</script>

# Testumgebung

::: danger TESTDATEN
**TESTDATEN.** Diese Seite beschreibt ausschließlich Development und Staging. Die Konten und Secrets hier existieren nur dort, nie in Production. Verwende in Testumgebungen keine echten Personen- oder Vereinsdaten.
:::

## Umgebungen

| Umgebung | URL | Zweck | Mail |
|---|---|---|---|
| Production | [app.ematchef.ch](https://app.ematchef.ch) | Echte Daten, echter Betrieb. Keine Demo-Konten. | Amazon SES |
| Staging | [staging.ematchef.ch](https://staging.ematchef.ch) | Release-Abnahme vor Production, eigene Datenbank. | Mailtrap (Staging-Sandbox) |
| Development | [dev.ematchef.ch](https://dev.ematchef.ch) | Entwicklung und Tests der aktuellen `develop`-Version. | Mailtrap (Dev-Sandbox) |
| Lokal | `docker compose up` | Eigener Rechner. | Mailtrap oder `null://null` (kein Versand) |

API: `api.<umgebung>.ematchef.ch`. Development und Staging zeigen einen gelben Hinweisbalken in der App.

## Demo-Konten

Alle Demo-Konten haben das Passwort **<code>{{ data.password }}</code>**. Die Adressen sind synthetisch (`<rolle> ( a ) {{ data.domain }}`) und keine echten Postfächer. Sie werden nur auf Development und Staging mit `app:create-role-users` bzw. `app:dev-demo:reset` angelegt.

<table>
  <thead>
    <tr><th>Login</th><th>Rolle</th><th>Gruppe</th><th>2FA</th></tr>
  </thead>
  <tbody>
    <tr v-for="a in data.accounts" :key="a.key">
      <td><code>{{ displayEmail(a.email) }}</code></td>
      <td>{{ a.label }} (<code>{{ a.role }}</code>)</td>
      <td>{{ groups[a.group] }}</td>
      <td>{{ a.totp ? 'TOTP' : '–' }}</td>
    </tr>
  </tbody>
</table>

Rollen: `sa` Superadmin, `org` Organisationschef, `sub` Suborgchef, `mw` Materialchef, `cmw` Co-Materialchef, `dc` Departmentchef, `l1`–`l3` Leader, `u` User, `komm` Kommunikation, `spon` Sponsoring, `lw`/`clw` Logistikwart, `bl` Bereichsleitung.

## Zwei-Faktor-Login (TOTP) der Admin-Demo-Konten

Für die globalen Adminrollen ist TOTP verpflichtend. Die Demo-Konten haben feste **Test-Secrets**, damit nach jedem Neuaufbau dieselben QR-Codes funktionieren. Scanne den QR-Code mit einer Authenticator-App (Google Authenticator, Microsoft Authenticator, 2FAS, Bitwarden …) oder gib den Setup-Key manuell ein (zeitbasiert, 6 Stellen, 30 Sekunden). Normale Konten erhalten bei der Einrichtung in der App ein zufälliges Secret.

<div v-for="a in withTotp" :key="a.key" style="display:flex;flex-wrap:wrap;gap:16px;align-items:center;margin:16px 0;padding:12px 16px;border:2px dashed var(--vp-c-danger-1);border-radius:8px">
  <img :src="a.totp.qr" width="192" height="192" :alt="'QR ' + displayEmail(a.email)" />
  <div>
    <p style="margin:0 0 4px"><strong style="color:var(--vp-c-danger-1)">TESTDATEN</strong></p>
    <p style="margin:0">Login: <code>{{ displayEmail(a.email) }}</code></p>
    <p style="margin:0">Rolle: {{ a.label }} (<code>{{ a.role }}</code>)</p>
    <p style="margin:0">Setup-Key: <code>{{ a.totp.secretGrouped }}</code></p>
  </div>
</div>

## Test-E-Mails

Development und Staging versenden **keine** Mails an echte Empfänger. Alle Nachrichten werden in der jeweiligen [Mailtrap](https://mailtrap.io) Email Sandbox abgefangen (Dev und Staging getrennt): E-Mail-Verifizierung, Passwort-Reset, Einladungen, Department- und Grossanlass-Nachrichten und künftig Sicherheitsbenachrichtigungen.

Den Zugang zur Sandbox bekommst du vom Team (interner Entwickler-Zugang, nicht öffentlich). Zugangsdaten stehen nie im Repository oder hier; sie liegen nur als `MAILER_DSN` in der Umgebung des jeweiligen Servers.

Production verwendet unverändert den bestehenden Amazon-SES-Versand.

## Weiterführend

Die technische Projektdokumentation (Architektur, Domänenmodell, Entwicklung, Deploy) liegt im Repository und wird dort gepflegt: [docs/ auf GitHub](https://github.com/eMatChef/eMatChef1/tree/develop/docs). Lokale Einrichtung: [README](https://github.com/eMatChef/eMatChef1#readme).
