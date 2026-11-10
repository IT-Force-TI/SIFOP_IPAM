// Configuration technique de l'application, lue dans les variables d'environnement Vite
// (fichiers .env, .env.local, .env.production… — voir .env.example).

export type DataSource = 'mock' | 'api'

// `?? {}` : permet aussi d'importer la configuration hors de Vite (scripts, tests Node).
const env: Partial<ImportMetaEnv> = import.meta.env ?? {}

/** URL de base de l'API, sans « / » final. Relative (/api) ou absolue (https://api.ecole.tg/api). */
const apiUrl = (env.VITE_API_URL || '/api').replace(/\/+$/, '')

export const appConfig = {
  /**
   * Source des données :
   *  - 'mock' (par défaut) : fake data en mémoire du navigateur, aucun backend nécessaire ;
   *  - 'api'               : backend Node.js réel.
   */
  dataSource: (env.VITE_DATA_SOURCE === 'api' ? 'api' : 'mock') as DataSource,
  apiUrl,
  /**
   * Origine des fichiers téléversés (/uploads/…). Vide si l'API est sur le même domaine
   * que le site ; sinon déduite de VITE_API_URL.
   */
  assetOrigin: /^https?:\/\//.test(apiUrl) ? new URL(apiUrl).origin : '',
  /** Délai simulé (ms) des fake data, pour afficher les chargements comme en réel. */
  mockLatency: Math.max(0, Number(env.VITE_MOCK_LATENCY ?? 250) || 0),
}

export const isMockMode = appConfig.dataSource === 'mock'
