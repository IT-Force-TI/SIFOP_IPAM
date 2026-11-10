# Reconnecter le frontend au backend

Le frontend et le backend sont deux projets indépendants. Ils communiquent uniquement par
l'API HTTP (`/api/...`) ; aucun fichier n'est partagé entre eux.

## 1. Démarrer le backend (projet `emge-backend`)

```bash
cd emge-backend
cp .env.example .env      # adaptez la base PostgreSQL, JWT_SECRET, le premier administrateur
npm install
npm run seed              # facultatif : mêmes contenus d'exemple que les fake data
npm run dev               # http://127.0.0.1:8080
```

## 2. Lancer le frontend en mode API

```bash
cd emge-frontend
npm run dev:api           # VITE_DATA_SOURCE=api — /api et /uploads redirigés vers le port 8080
```

Autre adresse de backend en développement : `API_TARGET=http://192.168.1.20:8080 npm run dev:api`.

C'est tout : les vues ne changent pas, seule l'implémentation des services change
(`src/services/mock` → `src/services/api`).

## 3. Mise en production : trois montages possibles

**A. Même domaine, reverse proxy (recommandé).** Le frontend compilé (`npm run build:api`,
dossier `dist/`) est servi par Nginx / l'hébergeur ; `/api` et `/uploads` sont redirigés
vers le backend. Aucune configuration CORS ni cookie particulière.

```nginx
location /api/     { proxy_pass http://127.0.0.1:8080; }
location /uploads/ { proxy_pass http://127.0.0.1:8080; }
location /         { try_files $uri /index.html; }
```

**B. Un seul serveur Node.** Dans le `.env` du backend : `CLIENT_DIST=../emge-frontend/dist`.
Le backend sert alors l'API et le site compilé.

**C. Domaines différents** (ex. site `www.ecole.tg`, API `api.ecole.tg`).
- Frontend : `VITE_API_URL=https://api.ecole.tg/api` au moment du `npm run build:api`.
- Backend : `CORS_ORIGIN=https://www.ecole.tg`, `COOKIE_SECURE=true`, `TRUST_PROXY=1`.
  Si les deux domaines ne partagent pas le même domaine principal, ajoutez
  `COOKIE_SAMESITE=none` (HTTPS obligatoire).
- Les images téléversées (`/uploads/...`) sont automatiquement chargées depuis l'origine
  de l'API (`utils/format.ts → assetUrl`).

## Correspondance services ↔ routes de l'API

| Service (frontend) | Route (backend) |
|---|---|
| `auth.login / logout / me` | `POST /api/auth/login` · `POST /api/auth/logout` · `GET /api/auth/me` |
| `settings.getPublic` | `GET /api/public/settings` |
| `settings.get / update` | `GET /api/admin/settings` · `PUT /api/admin/settings` |
| `content.listPublished / getPublished` | `GET /api/public/content/:kind[/:id]` |
| `content.list / create / update / remove` | `GET·POST /api/admin/content/:kind` · `PUT·DELETE /api/admin/content/:kind/:id` |
| `content.uploadImage` | `POST /api/admin/uploads` |
| `requests.submit` | `POST /api/public/requests/:kind` |
| `requests.list / updateStatus / remove` | `GET /api/admin/requests/:kind` · `PATCH·DELETE /api/admin/requests/:kind/:id` |
| `users.list / create / update / remove` | `GET·POST /api/admin/users` · `PUT·DELETE /api/admin/users/:id` |
| `dashboard.get` | `GET /api/admin/dashboard` |

`kind` de contenu : `actualites`, `evenements`, `galerie`.
`kind` de demande : `preinscriptions`, `visites`, `messages`.

## Faire évoluer l'API sans casser le frontend

Pour ajouter un champ ou une fonctionnalité, gardez ces fichiers alignés :

1. `backend/src/models/*.js` (méthode `toJSON`) et `backend/src/utils/schemas.js` ;
2. `frontend/src/models/index.ts` (types) ;
3. `frontend/src/services/contracts.ts`, puis `services/api` **et** `services/mock` ;
4. `frontend/src/mocks/data.ts` et `mocks/validation.ts` si la donnée est fictive en démo.

TypeScript signale toute implémentation qui ne respecte plus le contrat.
