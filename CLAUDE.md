# CLAUDE.md

Ce fichier guide Claude Code sur ce dépôt.

## Projet

MGHL (Mini Games Hockey League) — site de mini-jeux quotidiens autour de la LNH, inspiré de teuteuf.fr. Projet personnel, alimente le portfolio de Maxime.

4 jeux au MVP :
- **Devine le joueur** — joueur mystère du jour, 6 tentatives, feedback par attribut (équipe, poste, nationalité, numéro, âge, taille, année de draft), photo floutée qui se précise à chaque tentative.
- **Devine le logo** — logo NHL du jour, 6 tentatives, révélation par zoom progressif.
- **Devine le roster** — équipe du jour à deviner via les nationalités de son effectif (formations par lignes/duos), 6 tentatives, indice aléatoire (prénom de joueur, conférence...) à chaque échec.
- **But ou arrêt** — manche de 5 clips vidéo (YouTube embarqué), deviner but ou arrêt, score sur 5.

Player Grid envisagé mais hors périmètre du MVP (voir spec).

## Stack

- **Astro** + îlots **React** (TypeScript) — statique par défaut, JS uniquement sur les composants interactifs
- **SCSS** pour les styles
- **Vitest** pour les tests
- Données : API non-officielle `api-web.nhle.com`, synchronisées au build (pas d'appel en direct au runtime)
- Hébergement : **Netlify**, déploiement continu + rebuild quotidien programmé

## Architecture

```
/
├── astro.config.mjs
├── scripts/sync-nhl-data.ts     → fetch API NHL avant build, écrit src/data/generated/
├── .github/workflows/
│   ├── ci.yml                   → lint + tests + build sur push/PR
│   └── daily-rebuild.yml        → cron quotidien → webhook Netlify
├── docs/superpowers/{specs,plans}/
└── src/
    ├── layouts/                  → BaseLayout, GameLayout
    ├── components/                → UI partagée (ProgressiveReveal, GuessInput, ShareResult, StreakBadge...)
    ├── games/<nom-du-jeu>/        → Game.tsx (îlot) + logic.ts (pur, testé) + logic.test.ts
    ├── lib/
    │   ├── nhl-api/               → client + types — appelé uniquement par scripts/sync-nhl-data.ts
    │   ├── daily-puzzle/seed.ts   → tirage déterministe du jour, exécuté au build
    │   └── storage/stats.ts       → wrapper localStorage (séries, stats)
    ├── data/{curated,generated}/  → curated = versionné (lignes, clips) / generated = régénéré au build, gitignore
    ├── pages/jeux/*.astro         → une route par jeu
    └── styles/
```

Un jeu = un dossier autonome (composant + logique + test), isolation par dossier, pas par repo. `lib/nhl-api` n'est jamais expédié au navigateur.

Détail complet : `docs/superpowers/specs/2026-09-08-mghl-mvp-design.md`.

## Règles de dev

**Git**
- Une branche par fonctionnalité conséquente, créée depuis `master` : `feat-<slug>`, `fix-<slug>`, `config-<slug>`, `refacto-<slug>`
- Push immédiat sur `origin` à la création de la branche
- Commit : `<TYPE> : <description en anglais>` — `FEAT :`, `FIX :`, `CONFIG :`, `REFACTO :`
- Merge avec `git merge --no-ff`, branche jamais supprimée après merge
- Tag Git à chaque sortie : `v1.0.0` (jeu 1), `v1.1.0`/`v1.2.0` (correctifs), `v2.0.0` (jeu 2)...
- Pas de Gitflow — `master` reflète toujours la prod
- Toujours attendre confirmation avant de committer

**Tests**
- Logique pure testée (Vitest) : `logic.ts` de chaque jeu, `daily-puzzle/seed.ts`, `nhl-api` (normalisation), `storage/stats.ts`
- Câblage UI/DOM non testé unitairement
- **TDD obligatoire** sur les modules ci-dessus dès que la logique est complexe (test en échec écrit avant le code)
- Test d'intégration sur fixture enregistrée pour le contrat API NHL — pas d'appel réseau réel en CI
- Avant de committer une modif visuelle/interactive : `npm run test` + `npm run build`, aucune erreur

**CI/CD**
- CI (GitHub Actions) : lint + tests + build sur chaque push/PR
- CD : gérée nativement par Netlify (déploiement auto par push, preview par branche)
- Rebuild quotidien programmé : rafraîchit les données et fait tourner le puzzle du jour
