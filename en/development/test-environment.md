---
title: Test environment
description: Environments, demo accounts, test TOTP and test emails for eMatChef development and staging.
head:
  - - meta
    - name: robots
      content: noindex, nofollow
---

<script setup>
import { data } from '../../.vitepress/demo-accounts.data.ts'
const groups = {"global": "Global", "department": "Department", "grossanlass": "Large event", "supplier": "Supplier"}
const withTotp = data.accounts.filter((a) => a.totp)
</script>

# Test environment

::: danger TEST DATA
**TEST DATA.** This page only covers development and staging. The accounts and secrets here exist only there, never in production. Do not use real personal or club data in test environments.
:::

## Environments

| Environment | URL | Purpose | Mail |
|---|---|---|---|
| Production | [app.ematchef.ch](https://app.ematchef.ch) | Real data, real operation. No demo accounts. | Amazon SES |
| Staging | [staging.ematchef.ch](https://staging.ematchef.ch) | Release acceptance before production, separate database. | Mailtrap (staging sandbox) |
| Development | [dev.ematchef.ch](https://dev.ematchef.ch) | Development and testing of the current `develop` version. | Mailtrap (dev sandbox) |
| Local | `docker compose up` | Your own machine. | Mailtrap or `null://null` (no sending) |

API: `api.<environment>.ematchef.ch`. Development and staging show a yellow notice bar in the app.

## Demo accounts

All demo accounts use the password **<code>{{ data.password }}</code>**. The addresses are synthetic (`<role>@{{ data.domain }}`) and not real mailboxes. They are only created on development and staging with `app:create-role-users` or `app:dev-demo:reset`.

<table>
  <thead>
    <tr><th>Login</th><th>Role</th><th>Group</th><th>2FA</th></tr>
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

Roles: `sa` superadmin, `org` organisation chief, `sub` sub-organisation chief, `mw` material manager, `cmw` co-material manager, `dc` department chief, `l1`–`l3` leaders, `u` user, `komm` communication, `spon` sponsoring, `lw`/`clw` logistics, `bl` area lead.

## Two-factor login (TOTP) of the admin demo accounts

TOTP is mandatory for the global admin roles. The demo accounts have fixed **test secrets** so the same QR codes keep working after every rebuild. Scan the QR code with an authenticator app (Google Authenticator, Microsoft Authenticator, 2FAS, Bitwarden …) or enter the setup key manually (time-based, 6 digits, 30 seconds). Normal accounts get a random secret when they set up TOTP in the app.

<div v-for="a in withTotp" :key="a.key" style="display:flex;flex-wrap:wrap;gap:16px;align-items:center;margin:16px 0;padding:12px 16px;border:2px dashed var(--vp-c-danger-1);border-radius:8px">
  <img :src="a.totp.qr" width="192" height="192" :alt="'QR ' + a.email" />
  <div>
    <p style="margin:0 0 4px"><strong style="color:var(--vp-c-danger-1)">TEST DATA</strong></p>
    <p style="margin:0">Login: <code>{{ a.email }}</code></p>
    <p style="margin:0">Role: {{ a.label }} (<code>{{ a.role }}</code>)</p>
    <p style="margin:0">Setup key: <code>{{ a.totp.secretGrouped }}</code></p>
  </div>
</div>

## Test emails

Development and staging send **no** mail to real recipients. All messages are caught in the respective [Mailtrap](https://mailtrap.io) email sandbox (dev and staging are separate): email verification, password reset, invitations, department and large-event messages and, later, security notifications.

Ask the team for sandbox access (internal developer access, not public). Credentials are never in the repository or on this page; they exist only as `MAILER_DSN` in the environment of the respective server.

Production keeps using the existing Amazon SES delivery unchanged.

## Further reading

The technical project documentation (architecture, domain model, development, deploy) lives in the repository: [docs/ on GitHub](https://github.com/eMatChef/eMatChef1/tree/develop/docs). Local setup: [README](https://github.com/eMatChef/eMatChef1#readme).
