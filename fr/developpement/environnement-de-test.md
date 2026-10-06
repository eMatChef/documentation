---
title: Environnement de test
description: Environnements, comptes démo, TOTP de test et e-mails de test pour le développement et le staging d’eMatChef.
head:
  - - meta
    - name: robots
      content: noindex, nofollow
---

<script setup>
import { data } from '../../.vitepress/demo-accounts.data.ts'
const groups = {"global": "Global", "department": "Département", "grossanlass": "Grand événement", "supplier": "Fournisseur"}
const withTotp = data.accounts.filter((a) => a.totp)
</script>

# Environnement de test

::: danger DONNÉES DE TEST
**DONNÉES DE TEST.** Cette page ne concerne que le développement et le staging. Les comptes et secrets n’existent que là, jamais en production. N’utilise pas de données réelles dans les environnements de test.
:::

## Environnements

| Environnement | URL | Usage | Mail |
|---|---|---|---|
| Production | [app.ematchef.ch](https://app.ematchef.ch) | Données réelles. Aucun compte démo. | Amazon SES |
| Staging | [staging.ematchef.ch](https://staging.ematchef.ch) | Validation avant production, base séparée. | Mailtrap (sandbox staging) |
| Development | [dev.ematchef.ch](https://dev.ematchef.ch) | Développement et tests de la version `develop`. | Mailtrap (sandbox dev) |
| Local | `docker compose up` | Ton ordinateur. | Mailtrap ou `null://null` (pas d’envoi) |

API : `api.<environnement>.ematchef.ch`. Dev et staging affichent une barre jaune dans l’app.

## Comptes démo

Tous les comptes démo ont le mot de passe **<code>{{ data.password }}</code>**. Les adresses sont synthétiques (`<rôle>@{{ data.domain }}`), pas de vraies boîtes. Elles ne sont créées que sur dev et staging avec `app:create-role-users` ou `app:dev-demo:reset`.

<table>
  <thead>
    <tr><th>Login</th><th>Rôle</th><th>Groupe</th><th>2FA</th></tr>
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

Rôles : `sa` superadmin, `org` chef d’organisation, `sub` sous-chef, `mw` responsable matériel, `cmw` co-responsable, `dc` chef de département, `l1`–`l3` leaders, `u` utilisateur, `komm` communication, `spon` sponsoring, `lw`/`clw` logistique, `bl` chef de secteur.

## Connexion à deux facteurs (TOTP) des comptes démo admin

Le TOTP est obligatoire pour les rôles admin globaux. Les comptes démo ont des **secrets de test** fixes, pour que les mêmes codes QR fonctionnent après chaque reconstruction. Scanne le code QR avec une application d’authentification (Google Authenticator, Microsoft Authenticator, 2FAS, Bitwarden …) ou saisis la clé manuellement (temporel, 6 chiffres, 30 secondes). Les comptes normaux reçoivent un secret aléatoire lors de la configuration dans l’app.

<div v-for="a in withTotp" :key="a.key" style="display:flex;flex-wrap:wrap;gap:16px;align-items:center;margin:16px 0;padding:12px 16px;border:2px dashed var(--vp-c-danger-1);border-radius:8px">
  <img :src="a.totp.qr" width="192" height="192" :alt="'QR ' + a.email" />
  <div>
    <p style="margin:0 0 4px"><strong style="color:var(--vp-c-danger-1)">DONNÉES DE TEST</strong></p>
    <p style="margin:0">Login: <code>{{ a.email }}</code></p>
    <p style="margin:0">Rôle: {{ a.label }} (<code>{{ a.role }}</code>)</p>
    <p style="margin:0">Clé de configuration: <code>{{ a.totp.secretGrouped }}</code></p>
  </div>
</div>

## E-mails de test

Dev et staging n’envoient **aucun** e-mail à de vrais destinataires. Tous les messages sont interceptés dans la sandbox [Mailtrap](https://mailtrap.io) respective (dev et staging séparés) : vérification d’e-mail, réinitialisation du mot de passe, invitations, messages de département et de grand événement, puis notifications de sécurité.

L’accès à la sandbox s’obtient auprès de l’équipe (accès développeur interne, non public). Les identifiants ne figurent jamais dans le dépôt ni ici ; ils n’existent que comme `MAILER_DSN` dans l’environnement du serveur.

La production continue d’utiliser l’envoi Amazon SES existant, sans changement.

## Pour aller plus loin

La documentation technique (architecture, modèle de domaine, développement, déploiement) se trouve dans le dépôt : [docs/ sur GitHub](https://github.com/eMatChef/eMatChef1/tree/develop/docs). Installation locale : [README](https://github.com/eMatChef/eMatChef1#readme).
