/**
 * Erreur unique remontée aux vues, quelle que soit la source des données.
 * Même format que les réponses d'erreur du backend : { message, errors: { champ: message } }.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors: Record<string, string> = {},
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

type Listener = () => void
const unauthorizedListeners: Listener[] = []

/** Abonnement : appelé quand une session a expiré (réponse 401), en mode API comme en mode fake data. */
export function onUnauthorized(listener: Listener) {
  unauthorizedListeners.push(listener)
}

export function notifyUnauthorized() {
  for (const listener of unauthorizedListeners) listener()
}

/** Construit l'erreur et prévient les abonnés si la session n'est plus valide. */
export function apiError(status: number, message: string, errors?: Record<string, string>) {
  if (status === 401) notifyUnauthorized()
  return new ApiError(message, status, errors)
}

/** Message lisible d'une erreur, avec le détail des champs invalides. */
export function errorMessage(e: unknown, withFields = false): string {
  const message = e instanceof Error ? e.message : 'Une erreur est survenue.'
  if (!withFields || !(e instanceof ApiError)) return message
  return [message, ...Object.values(e.errors || {})].join(' ')
}
