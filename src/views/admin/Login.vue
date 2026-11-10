<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { isMockMode } from '../../config/app'
import { DEMO_ACCOUNT } from '../../mocks/data'
import { resetMockData } from '../../mocks/db'
import { errorMessage } from '../../services'
import { login } from '../../stores/auth'
import { loadSettings, school } from '../../stores/school'
import Icon from '../../components/Icon.vue'
const email = ref(''),
  password = ref(''),
  visible = ref(false),
  busy = ref(false),
  error = ref(''),
  notice = ref('')
const route = useRoute(),
  router = useRouter()
if (route.query.error)
  error.value = 'Le serveur est injoignable. Vérifiez votre connexion et réessayez.'
if (!school.loaded) loadSettings()

// --- Mode démonstration (fake data) ---
function fillDemo() {
  email.value = DEMO_ACCOUNT.email
  password.value = DEMO_ACCOUNT.password
}
function resetDemo() {
  resetMockData()
  notice.value = 'Les données de démonstration ont été réinitialisées.'
  loadSettings()
}

async function submit() {
  busy.value = true
  error.value = ''
  notice.value = ''
  try {
    await login(email.value, password.value)
    const target =
      typeof route.query.redirect === 'string' &&
      /^\/admin(?:\/|$)/.test(route.query.redirect) &&
      !route.query.redirect.startsWith('/admin/connexion')
        ? route.query.redirect
        : '/admin'
    await router.push(target)
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    busy.value = false
  }
}
</script>
<template>
  <main class="login-page">
    <section class="login-brand">
      <RouterLink to="/" class="login-logo"
        ><span class="school-mark"><Icon name="school" :size="30" /></span
        ><span
          ><strong>{{ school.value.shortName }}</strong><small>Espace administrateur</small></span
        ></RouterLink
      >
      <div>
        <h1>Gérez l’établissement<br />depuis un espace sécurisé</h1>
        <p>
          Actualités, événements, galerie, préinscriptions et demandes de visite sont accessibles
          depuis cet espace privé.
        </p>
      </div>
      <p class="login-copyright">{{ school.value.name }}</p>
    </section>
    <section class="login-form-side">
      <form @submit.prevent="submit">
        <span class="eyebrow">ESPACE PRIVÉ</span>
        <h2>Bienvenue</h2>
        <p>Connectez-vous à votre compte administrateur.</p>
        <div v-if="isMockMode" class="info-note demo-note">
          <Icon name="info" :size="18" />
          <div>
            <p>
              <strong>Mode démonstration</strong> — données fictives enregistrées dans ce
              navigateur. Compte : {{ DEMO_ACCOUNT.email }} / {{ DEMO_ACCOUNT.password }}
            </p>
            <button type="button" class="text-button" @click="fillDemo">
              Remplir avec le compte de démonstration
            </button>
            <button type="button" class="text-button" @click="resetDemo">
              Réinitialiser les données
            </button>
          </div>
        </div>
        <div v-if="notice" class="alert success" role="status">{{ notice }}</div>
        <div v-if="error" class="alert error" role="alert">{{ error }}</div>
        <label
          >Adresse email
          <div class="input-icon">
            <Icon name="mail" :size="18" /><input
              v-model="email"
              type="email"
              autocomplete="username"
              required
              placeholder="nom@exemple.com"
            /></div></label
        ><label
          >Mot de passe
          <div class="input-icon">
            <Icon name="lock" :size="18" /><input
              v-model="password"
              :type="visible ? 'text' : 'password'"
              autocomplete="current-password"
              required
              placeholder="Votre mot de passe"
            /><button
              type="button"
              class="icon-button"
              :aria-label="visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
              @click="visible = !visible"
            >
              <Icon name="eye" :size="18" />
            </button></div></label
        ><button class="btn full-width" :disabled="busy">
          <Icon v-if="busy" name="loader" :size="18" />{{
            busy ? 'Connexion…' : 'Se connecter'
          }}</button
        ><RouterLink to="/" class="login-back"
          ><Icon name="left" :size="16" />Retour au site</RouterLink
        >
      </form>
    </section>
  </main>
</template>
