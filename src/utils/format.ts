import { appConfig } from '../config/app'

export const money = (n: number) =>
  new Intl.NumberFormat('fr-FR').format(n).replace(/ /g, ' ') + ' FCFA'

export const dateLabel = (value: string) =>
  value
    ? new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(
        new Date(value.length === 10 ? value + 'T12:00:00' : value),
      )
    : '—'

export const statusLabels: Record<string, string> = {
  PENDING: 'En attente',
  ACCEPTED: 'Acceptée',
  REJECTED: 'Refusée',
  CONFIRMED: 'Confirmée',
  CANCELLED: 'Annulée',
  UNREAD: 'Non lu',
  READ: 'Lu',
}

/** Date du jour au format AAAA-MM-JJ (heure locale). */
export const todayIso = () => new Date().toLocaleDateString('en-CA')

/**
 * Adresse affichable d'une image. Les fichiers téléversés (/uploads/…) sont servis par le
 * backend : si l'API est sur un autre domaine, on préfixe son origine.
 */
export const assetUrl = (url: string) =>
  url && url.startsWith('/uploads/') ? appConfig.assetOrigin + url : url
