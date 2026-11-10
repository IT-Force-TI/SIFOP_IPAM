# Sites — un dossier par établissement

Le frontend (design, composants, pages, images communes) est **unique** et partagé.
Chaque établissement n'a qu'un dossier de données ici.

```
sites/
└── sifop-ipam/
    └── site.json         les 5 champs du fichier Excel
```

## Les 5 champs (clés = en-têtes exacts de l'Excel)

```json
{
  "NOM PRENOMS": "KPANDJA Nadjomb Gmadjwé",
  "PROFFESSION": "Fondateur",
  "CONTACTS": "90 05 30 54",
  "ETABLISSEMENTS": "SIFOP - IPAM",
  "Quartier": "Lomnava(bassar)"
}
```

Le gabarit `src/config/site-template.ts` en déduit tout le site : nom dans l'en-tête et le
pied de page, héros « Bienvenue à … », mot de la direction signé par le responsable,
bloc « Notre établissement », coordonnées, FAQ. **Rien n'est inventé** : ce qui n'est pas
dans l'Excel (email, horaires, slogan, tarifs, histoire) n'est simplement pas affiché
(tarifs : « Sur demande »).

## Ajouter un site

**Option A — à la main** : créer `sites/<id>/site.json` (id en minuscules, chiffres et
tirets, ex. `ecole-la-grace`) avec les 5 champs ci-dessus.

**Option B — depuis l'Excel** :
1. Excel → Fichier → Enregistrer sous → « CSV UTF-8 ».
2. `npm run site:nouveau -- chemin\vers\fichier.csv`
   Une ligne = un site. L'id est tiré du nom de l'établissement (`SIFOP - IPAM` → `sifop-ipam`).
   Les lignes incomplètes sont ignorées (signalées), un site existant n'est jamais écrasé
   (sauf `--remplacer`).

Puis :

```bash
npm run site -- liste                  # sites disponibles
npm run site -- sifop-ipam           # développement : http://127.0.0.1:5173
npm run site -- sifop-ipam build     # version à héberger : dist-sites/sifop-ipam/
```

Ou mettre `VITE_SITE=sifop-ipam` dans `.env.local`. Sans rien, c'est `sifop-ipam`
(build dans `dist/`).

## Isolation des données

Seul le dossier du site choisi est compilé (module virtuel `virtual:site` dans
`vite.config.ts`) : le build d'un établissement ne contient aucune donnée d'un autre.
Chaque site a aussi son propre stockage navigateur des données de démonstration et son
propre dossier de sortie.

## Plus tard : logo et photo du responsable

Tant qu'ils ne sont pas fournis, un monogramme (initiales) est affiché. Pour les ajouter :
placer les images dans `public/sites/<id>/` puis compléter `site.json` :

```json
  "logo": "/sites/sifop-ipam/logo.png",
  "photoResponsable": "/sites/sifop-ipam/fondateur.jpg"
```

## Textes communs à valider

Les cycles (Maternelle / Primaire / Collège), les pièces d'admission et les « valeurs »
viennent de `src/config/defaults.ts` et s'appliquent à tous les sites. Si un établissement
n'a pas de collège par exemple, il faudra pouvoir les surcharger : à signaler.
