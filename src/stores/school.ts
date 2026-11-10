// Paramètres publics de l'établissement (coordonnées, tarifs) affichés sur tout le site.
// Valeurs du profil (config/school.ts) en attendant la réponse de la source de données.
import { reactive } from 'vue'
import { school as profile } from '../config/school'
import type { Settings } from '../models'
import { services } from '../services'
import { errorMessage } from '../services/errors'

export const school = reactive<{ value: Settings; error: string; loaded: boolean }>({
  value: { ...profile.settings },
  error: '',
  loaded: false,
})

export async function loadSettings() {
  try {
    school.value = await services.settings.getPublic()
    school.error = ''
    school.loaded = true
  } catch (e) {
    school.error = errorMessage(e)
  }
}
