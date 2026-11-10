// ============================================================================
//  PROFIL DE L'ÉTABLISSEMENT AFFICHÉ
//  Le profil provient du dossier sites/<id>/ du site sélectionné à la compilation
//  (variable VITE_SITE, voir vite.config.ts et sites/README.md). Seul ce site est
//  inclus dans le build : les données des autres sites n'y figurent jamais.
//
//  En mode API, les coordonnées et les tarifs (bloc `settings`) sont ensuite
//  remplacés par ceux enregistrés dans l'administration (GET /api/public/settings).
// ============================================================================
import site from 'virtual:site'
import type { SchoolProfile } from './types'

export type { CycleProfile, SchoolProfile, SiteData } from './types'

export const school: SchoolProfile = site

/** Classes par cycle, dérivées du profil (formulaires, filtres, fake data). */
export const classesByCycle: Record<string, string[]> = Object.fromEntries(
  school.cycles.map((c) => [c.name, c.classes]),
)
