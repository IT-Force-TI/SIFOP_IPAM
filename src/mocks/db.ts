// Mini « base de données » des fake data, dans le navigateur.
// Les modifications faites pendant une démonstration (préinscription envoyée, actualité
// publiée…) sont conservées dans le localStorage pour survivre au rechargement de la page.
// resetMockData() restaure les données d'origine.
import { appConfig } from '../config/app'
import { school } from '../config/school'
import type { ContentItem, SchoolRequest, Settings } from '../models'
import { type MockUser, seedContents, seedRequests, seedSettings, seedUsers } from './data'

const VERSION = 1
const STORAGE_KEY = `school-site:fake-data:${school.id}`

export interface MockState {
  version: number
  settings: Settings
  contents: ContentItem[]
  requests: SchoolRequest[]
  users: MockUser[]
  /** Utilisateur connecté (équivalent du cookie de session). */
  sessionUserId: number | null
}

let state: MockState | null = null

function seed(): MockState {
  return {
    version: VERSION,
    settings: seedSettings(),
    contents: seedContents(),
    requests: seedRequests(),
    users: seedUsers(),
    sessionUserId: null,
  }
}

function storage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

/** Accès à l'état (chargé à la première utilisation). */
export function db(): MockState {
  if (!state) {
    try {
      const saved = JSON.parse(storage()?.getItem(STORAGE_KEY) || 'null') as MockState | null
      state = saved && saved.version === VERSION ? saved : seed()
    } catch {
      state = seed()
    }
  }
  return state
}

/** Enregistre l'état. Si le stockage est plein (images volumineuses), l'état reste en mémoire. */
export function commit() {
  try {
    storage()?.setItem(STORAGE_KEY, JSON.stringify(db()))
  } catch {
    /* quota dépassé : les données restent valables jusqu'au rechargement */
  }
}

/** Restaure les fake data d'origine (et déconnecte l'administrateur de démonstration). */
export function resetMockData() {
  state = seed()
  commit()
}

export const nextId = (list: { id: number }[]) => list.reduce((max, x) => Math.max(max, x.id), 0) + 1

/** Copie profonde : les vues ne doivent jamais modifier l'état directement. */
export const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

/** Simule le délai réseau pour que les états de chargement restent visibles. */
export const latency = () =>
  new Promise<void>((resolve) => setTimeout(resolve, appConfig.mockLatency))
