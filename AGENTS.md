# Agents Guide — Frontend

- Vue 3 + Vite + TypeScript. Port 5173. Projet indépendant du backend.
- `npm run dev` : fake data (VITE_DATA_SOURCE=mock, défaut). `npm run dev:api` : backend réel.
- Les vues passent TOUJOURS par `services` (`src/services/index.ts`), jamais par fetch ni par `src/mocks`.
- Toute évolution de données : `src/models` → `services/contracts.ts` → `services/api` ET `services/mock`
  → `mocks/data.ts` / `mocks/validation.ts`, en restant aligné sur le backend.
- Multi-sites : données de chaque établissement dans `sites/<id>/` (voir sites/README.md), site choisi par VITE_SITE. Contenu commun : `src/config/defaults.ts`.
- Tests : `npm run test` (Playwright, fake data) ; `E2E_API=1 npm run test` avec le backend.
