// Point d'entrée unique des données : les vues importent `services` depuis ce fichier.
// La source est choisie par la variable VITE_DATA_SOURCE au moment de `npm run dev` /
// `npm run build` : 'mock' (fake data, par défaut) ou 'api' (backend réel).
import { appConfig } from '../config/app'
import type { DataServices } from './contracts'
import { apiServices } from './api'
import { mockServices } from './mock'

export const services: DataServices = appConfig.dataSource === 'api' ? apiServices : mockServices

export type * from './contracts'
export { ApiError, errorMessage } from './errors'
