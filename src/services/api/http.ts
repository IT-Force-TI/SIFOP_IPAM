// Client HTTP du backend : cookies de session, jeton CSRF, conversion des erreurs.
import { appConfig } from '../../config/app'
import { ApiError, apiError } from '../errors'

let csrf: { token: string; headerName: string } | null = null

/** Oublie le jeton CSRF (après connexion / déconnexion, ou s'il a été refusé). */
export function resetCsrf() {
  csrf = null
}

async function csrfToken() {
  if (!csrf) {
    const res = await fetch(appConfig.apiUrl + '/auth/csrf', { credentials: 'include' }).catch(
      () => null,
    )
    if (!res) throw unreachable()
    if (!res.ok) throw new ApiError('Impossible de sécuriser la requête. Réessayez.', res.status)
    csrf = (await res.json()) as { token: string; headerName: string }
  }
  return csrf
}

const unreachable = () =>
  new ApiError('Le serveur est injoignable. Vérifiez votre connexion et réessayez.', 0)

export async function http<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  const body = options.body
  if (body && !(body instanceof FormData) && !(body instanceof URLSearchParams))
    headers.set('Content-Type', 'application/json')
  if (options.method && !['GET', 'HEAD'].includes(options.method)) {
    const { token, headerName } = await csrfToken()
    headers.set(headerName, token)
  }
  let res: Response
  try {
    res = await fetch(appConfig.apiUrl + path, { ...options, headers, credentials: 'include' })
  } catch {
    throw unreachable()
  }
  if (res.status === 204) return undefined as T
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    if (res.status === 403 || res.status === 401) resetCsrf()
    throw apiError(res.status, data.message || 'La requête a échoué. Réessayez.', data.errors)
  }
  return data as T
}

export const json = (method: string, payload: unknown): RequestInit => ({
  method,
  body: JSON.stringify(payload),
})
