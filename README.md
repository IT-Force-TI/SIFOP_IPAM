# SIFOP - IPAM — Site web (Lomnava(bassar))

Déclinaison du site de référence (`../Front_Principal/emge-frontend`, inchangé) pour
**SIFOP - IPAM**. Même design, mêmes pages et fonctionnalités ; seules les données changent.

Données de l'établissement : **`sites/sifop-ipam/site.json`** (5 champs du fichier Excel).

| Champ Excel | Valeur |
|---|---|
| NOM PRENOMS | KPANDJA Nadjomb Gmadjwé |
| PROFFESSION | Fondateur |
| CONTACTS | 90 05 30 54 |
| ETABLISSEMENTS | SIFOP - IPAM |
| Quartier | Lomnava(bassar) |

## Démarrage

```bash
npm install          # une fois (node_modules n'est pas copié)
npm run dev          # http://127.0.0.1:5173
npm run build        # version à héberger dans dist/
```

Administration (démo) : http://127.0.0.1:5173/admin/connexion —
compte `direction@demo.local` / `Demo2026!`.

Ajouter le logo ou la photo du fondateur, ou créer un autre établissement à partir de ce
dossier : voir [sites/README.md](sites/README.md).

---

## Les deux sources de données

| Variable | Valeur | Effet |
|---|---|---|
| `VITE_DATA_SOURCE` | `mock` (défaut) | fake data dans le navigateur, aucun serveur |
| | `api` | backend Node.js réel |
| `VITE_API_URL` | `/api` (défaut) | API sur le même domaine (proxy Vite en développement) |
| | `https://api.ecole.tg/api` | API sur un autre domaine |
| `VITE_MOCK_LATENCY` | `250` (défaut) | délai simulé des fake data, en ms |

Raccourcis : `npm run dev:api` et `npm run build:api` (fichier `.env.api`).
Voir [docs/CONNEXION-BACKEND.md](docs/CONNEXION-BACKEND.md) pour reconnecter le backend.

## Architecture

```
src/
├── config/
│   ├── app.ts          source de données, URL de l'API (variables VITE_*)
│   └── school.ts       PROFIL DE L'ÉTABLISSEMENT : identité, textes, cycles, FAQ…
├── models/index.ts     types des données = format JSON exact de l'API
├── services/
│   ├── contracts.ts    interfaces des services (une méthode = une route de l'API)
│   ├── index.ts        choisit l'implémentation : `services.content.list(...)` etc.
│   ├── api/            implémentation HTTP (backend réel, cookies + CSRF)
│   ├── mock/           implémentation fake data (mêmes règles que le backend)
│   └── errors.ts       ApiError commune aux deux implémentations
├── mocks/
│   ├── data.ts         FAKE DATA (actualités, événements, galerie, demandes, comptes)
│   ├── db.ts           stockage en mémoire + localStorage, réinitialisation
│   └── validation.ts   validation identique au backend (mêmes messages)
├── stores/             état partagé : administrateur connecté, paramètres de l'école
├── utils/format.ts     montants, dates, libellés de statut, URL des images
├── components/ layouts/ views/   interface (n'utilise QUE `services`)
└── router.ts
```

Règle d'or : **les vues n'appellent jamais `fetch` ni les fake data directement**, elles
passent par `services`. Les deux implémentations respectent les mêmes contrats et
renvoient les mêmes formes de données (`src/models`), avec les mêmes erreurs
(`ApiError` : `message` + `errors` par champ). Changer de source ne touche aucune vue.

## Plusieurs établissements (multi-sites)

Un seul frontend, un dossier de données par établissement dans **`sites/`** :
voir [sites/README.md](sites/README.md).

```bash
npm run site -- sifop-ipam           # développement
npm run site -- sifop-ipam build     # dist-sites/sifop-ipam/
npm run site:nouveau -- etablissements.csv   # créer les sites depuis l'Excel (CSV)
```

`npm run dev` / `npm run build` sans précision = SIFOP - IPAM.
Contenu commun à tous les sites : `src/config/defaults.ts` ; gabarit des sites issus de
l'Excel : `src/config/site-template.ts`.

Le backend accepte les cycles Maternelle / Primaire / Collège et leurs classes
(`backend/src/utils/schemas.js`). Si un établissement a d'autres cycles ou classes,
mettez les deux fichiers à jour ensemble.

## Tests

```bash
npx playwright install chromium   # une fois
PLAYWRIGHT_CHROMIUM=1 npm run test   # sur les fake data, sans backend
E2E_API=1 PLAYWRIGHT_CHROMIUM=1 npm run test   # avec le backend démarré sur le port 8080
```

Deux scénarios (deux navigateurs partageant les données, panne réseau) ne tournent
qu'avec le backend.
