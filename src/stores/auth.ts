// Administrateur connecté (partagé par le routeur et l'espace d'administration).
import { reactive } from 'vue'
import type { AdminUser } from '../models'
import { services } from '../services'
import { onUnauthorized } from '../services/errors'

export const auth = reactive<{ user: AdminUser | null; loaded: boolean }>({
  user: null,
  loaded: false,
})

// Session expirée (401) : on oublie l'utilisateur, le routeur redirigera vers la connexion.
onUnauthorized(() => {
  auth.user = null
  auth.loaded = false
})

/** Recharge l'utilisateur connecté. Lève une erreur si le serveur est injoignable. */
export async function loadUser() {
  auth.user = await services.auth.me()
  auth.loaded = true
  return auth.user
}

export async function login(email: string, password: string) {
  auth.user = await services.auth.login(email, password)
  auth.loaded = true
  return auth.user
}

export async function logout() {
  await services.auth.logout()
  auth.user = null
  auth.loaded = true
}
