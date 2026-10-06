---
title: Ambiente di test
description: Ambienti, account demo, TOTP di test ed e-mail di test per sviluppo e staging di eMatChef.
head:
  - - meta
    - name: robots
      content: noindex, nofollow
---

<script setup>
import { data } from '../../.vitepress/demo-accounts.data.ts'
const groups = {"global": "Globale", "department": "Dipartimento", "grossanlass": "Grande evento", "supplier": "Fornitore"}
const withTotp = data.accounts.filter((a) => a.totp)
</script>

# Ambiente di test

::: danger DATI DI TEST
**DATI DI TEST.** Questa pagina riguarda solo sviluppo e staging. Gli account e i segreti esistono solo lì, mai in produzione. Non usare dati reali negli ambienti di test.
:::

## Ambienti

| Ambiente | URL | Scopo | Mail |
|---|---|---|---|
| Production | [app.ematchef.ch](https://app.ematchef.ch) | Dati reali. Nessun account demo. | Amazon SES |
| Staging | [staging.ematchef.ch](https://staging.ematchef.ch) | Verifica prima della produzione, database separato. | Mailtrap (sandbox staging) |
| Development | [dev.ematchef.ch](https://dev.ematchef.ch) | Sviluppo e test della versione `develop`. | Mailtrap (sandbox dev) |
| Locale | `docker compose up` | Il tuo computer. | Mailtrap o `null://null` (nessun invio) |

API: `api.<ambiente>.ematchef.ch`. Dev e staging mostrano una barra gialla nell’app.

## Account demo

Tutti gli account demo hanno la password **<code>{{ data.password }}</code>**. Gli indirizzi sono sintetici (`<ruolo>@{{ data.domain }}`), non caselle reali. Vengono creati solo su dev e staging con `app:create-role-users` o `app:dev-demo:reset`.

<table>
  <thead>
    <tr><th>Login</th><th>Ruolo</th><th>Gruppo</th><th>2FA</th></tr>
  </thead>
  <tbody>
    <tr v-for="a in data.accounts" :key="a.key">
      <td><code>{{ a.email }}</code></td>
      <td>{{ a.label }} (<code>{{ a.role }}</code>)</td>
      <td>{{ groups[a.group] }}</td>
      <td>{{ a.totp ? 'TOTP' : '–' }}</td>
    </tr>
  </tbody>
</table>

Ruoli: `sa` superadmin, `org` capo organizzazione, `sub` sotto-capo, `mw` responsabile materiale, `cmw` co-responsabile, `dc` capo dipartimento, `l1`–`l3` leader, `u` utente, `komm` comunicazione, `spon` sponsoring, `lw`/`clw` logistica, `bl` capo settore.

## Accesso a due fattori (TOTP) degli account demo admin

Il TOTP è obbligatorio per i ruoli admin globali. Gli account demo hanno **segreti di test** fissi, così gli stessi codici QR funzionano dopo ogni ricostruzione. Scansiona il codice QR con un’app di autenticazione (Google Authenticator, Microsoft Authenticator, 2FAS, Bitwarden …) o inserisci la chiave manualmente (a tempo, 6 cifre, 30 secondi). Gli account normali ricevono un segreto casuale quando configurano il TOTP nell’app.

<div v-for="a in withTotp" :key="a.key" style="display:flex;flex-wrap:wrap;gap:16px;align-items:center;margin:16px 0;padding:12px 16px;border:2px dashed var(--vp-c-danger-1);border-radius:8px">
  <img :src="a.totp.qr" width="192" height="192" :alt="'QR ' + a.email" />
  <div>
    <p style="margin:0 0 4px"><strong style="color:var(--vp-c-danger-1)">DATI DI TEST</strong></p>
    <p style="margin:0">Login: <code>{{ a.email }}</code></p>
    <p style="margin:0">Ruolo: {{ a.label }} (<code>{{ a.role }}</code>)</p>
    <p style="margin:0">Chiave di configurazione: <code>{{ a.totp.secretGrouped }}</code></p>
  </div>
</div>

## E-mail di test

Dev e staging **non** inviano e-mail a destinatari reali. Tutti i messaggi vengono intercettati nella rispettiva sandbox [Mailtrap](https://mailtrap.io) (dev e staging separate): verifica e-mail, reimpostazione password, inviti, messaggi di dipartimento e grande evento e, in futuro, notifiche di sicurezza.

L’accesso alla sandbox si ottiene dal team (accesso interno per sviluppatori, non pubblico). Le credenziali non sono mai nel repository né qui; esistono solo come `MAILER_DSN` nell’ambiente del server.

La produzione continua a usare l’invio Amazon SES esistente, invariato.

## Approfondimenti

La documentazione tecnica (architettura, modello di dominio, sviluppo, deploy) si trova nel repository: [docs/ su GitHub](https://github.com/eMatChef/eMatChef1/tree/develop/docs). Installazione locale: [README](https://github.com/eMatChef/eMatChef1#readme).
