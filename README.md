# eMatChef Dokumentation (`docs.ematchef.ch`)

Source of Truth der öffentlichen eMatChef-Dokumentation: Benutzeranleitung, Entwickler-Einstieg und Testumgebung.
`docs.ematchef.ch` ist nur die aus diesem Repository gebaute Website (VitePress, statisch).

**Abgrenzung**

| Frage | Ort |
|---|---|
| Wie benutze, entwickle oder teste ich eMatChef? | dieses Repository → `docs.ematchef.ch` |
| Wie ist eMatChef intern gebaut? (Architektur, Domain-Modell, Security, Entwicklungsregeln) | Hauptrepo [`eMatChef/eMatChef1` → `docs/`](https://github.com/eMatChef/eMatChef1/tree/develop/docs) |

Technische Details gehören nicht hierher, sondern ins Hauptrepo. Hier wird nur aus Benutzer- bzw. Entwicklersicht beschrieben.

## Struktur

```text
de/ en/ fr/ it/     Sprachen. Einstieg ist Deutsch (/ leitet nach /de/). Deutsch darf vollständiger sein.
.vitepress/         Konfiguration (Navigation/Sidebar je Sprache) und Daten-Loader
public/             robots.txt, llms.txt, index.html
scripts/            Demo-Daten-Import, Integritätsprüfung
demo-source.json    Quelle der Demo-Konten im Hauptrepo (Ref + Pfad)
images/             (bei Bedarf) Screenshots, je Bereich: profile/, material/, activities/, grossanlass/, ...
```

Seiten und Ordner entstehen mit den tatsächlich vorhandenen Funktionen, keine leeren Platzhalter. Neue Seite: Datei in
allen vier Sprachordnern anlegen (Sprachen ohne Übersetzung nicht entfernen) und in `.vitepress/config.ts` in die Sidebar
der jeweiligen Sprache eintragen (Links mit Sprachpräfix, z. B. `/de/hilfe/...`).
Screenshots gehören nach `images/<bereich>/` in dieses Repository, nie manuell auf den Server.
Weblate gilt nur für die App-UI, nicht für diese Seiten.

## Lokal

```bash
npm ci
DEMO_ACCOUNTS_FILE=../eMatChef/backend/data/seeds/dev-demo/demo-accounts.json npm run dev   # lokale Seed-Datei
npm run build && npm run check                                                               # wie CI (Quelle: Hauptrepo)
```

`npm run dev|build` rufen zuerst `npm run demo:fetch` auf. `DEMO_ACCOUNTS_FILE` ist nur lokal erlaubt, in CI bricht der Import damit ab.

## Demo-Daten (Testumgebung-Seite)

Die Seite *Anleitung → Entwicklung → Testumgebung* zeigt Demo-Konten, Passwort, Test-TOTP-QR-Codes und Setup-Keys.
**Source of Truth ist das Hauptrepo:** `backend/data/seeds/dev-demo/demo-accounts.json`. Dieselbe Datei legt die Konten per Seed an;
hier gibt es keine Kopie.

- `demo-source.json` nennt Repo, Ref (`develop`, kein fest eingetragener SHA) und Pfad. Der Ref bestimmt, welche Demo-Daten veröffentlicht werden.
- `scripts/fetch-demo-accounts.mjs` löst den Ref per `git ls-remote` auf einen Commit auf, lädt genau diese Dateiversion und
  protokolliert Ref und SHA in `.demo-data/source.json` (nicht eingecheckt, im Deploy-Log sichtbar).
- **Fail-closed:** Schlägt Auflösung, Download oder Validierung fehl, bricht der Build ab. Es gibt keinen Cache und keinen Fallback.
- Validierung (`scripts/demo-accounts-validate.mjs`): Die Datei muss `"publicDocumentation": true` enthalten, Domain exakt `demo.ematchef.ch`,
  alle Adressen `<key>@demo.ematchef.ch`, TOTP-Secrets nur als Base32. Das Hauptrepo entscheidet damit selbst, was öffentlich wird.
- `npm run check` prüft zusätzlich den Build-Output: keine Schlüssel/Tokens/SMTP-Zugangsdaten, nur TOTP-Secrets aus der Demo-Datei, Entwicklungsseiten nicht in der Sitemap.
- Ref abweichend (z. B. zum Test eines Branches): `DEMO_SOURCE_REF=<branch> npm run build`.

Es werden ausschliesslich Konten einer ausdrücklich dafür vorgesehenen Demo-/Testumgebung dokumentiert.
Keine Production-Zugänge, keine realen Personen, keine Mailtrap-Zugangsdaten, keine Secrets.

## CI/CD

| Workflow | Auslöser | Ablauf |
|---|---|---|
| `ci.yml` | Pull Request | `npm ci` → Build (tote interne Links brechen ab) → `npm run check` |
| `deploy.yml` | Merge nach `main`, manuell, `repository_dispatch` (`demo-accounts-changed`), wöchentlich | Production-Build → Prüfung → rsync nach Hetzner |

Der Deploy-Job läuft nur mit Repository-Variable `DEPLOY_ENABLED=true`; ohne sie wird nur gebaut (Probe).
Secrets (Repository-Secrets): `DOCS_SSH_HOST`, `DOCS_SSH_PORT`, `DOCS_SSH_USER`, `DOCS_SSH_KEY`, `DOCS_WEBROOT`. Nie einchecken.

Betrieb: Hetzner-Droplet `ematchef-api-prod`, Webroot `/var/www/ematchef-docs-prod`, Caddy-Block und DNS liegen im Hauptrepo (`deploy/caddy/Caddyfile.prod-docs.example`).

## Crawler

`public/robots.txt`: Suche und AI-Input erlaubt, Training nicht. `llms.txt` listet die öffentlichen Hilfeseiten.
