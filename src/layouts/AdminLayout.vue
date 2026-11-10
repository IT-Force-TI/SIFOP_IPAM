<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { errorMessage } from '../services'
import { auth, logout as endSession } from '../stores/auth'
import { loadSettings, school } from '../stores/school'
import Icon from '../components/Icon.vue'
const route = useRoute(),
  router = useRouter(),
  mobile = ref(false),
  error = ref(''),
  busy = ref(false)
watch(
  () => route.path,
  () => {
    mobile.value = false
  },
)
const items = [
  { to: '/admin', label: 'Tableau de bord', icon: 'dashboard' },
  { to: '/admin/actualites', label: 'Actualités', icon: 'news' },
  { to: '/admin/evenements', label: 'Événements', icon: 'calendar' },
  { to: '/admin/galerie', label: 'Galerie', icon: 'images' },
  { to: '/admin/preinscriptions', label: 'Préinscriptions', icon: 'file' },
  { to: '/admin/visites', label: 'Visites', icon: 'user' },
  { to: '/admin/messages', label: 'Messages', icon: 'message' },
  { to: '/admin/parametres', label: 'Paramètres', icon: 'settings' },
]
onMounted(() => {
  if (!school.loaded) loadSettings()
})
async function logout() {
  busy.value = true
  error.value = ''
  try {
    await endSession()
    await router.push('/admin/connexion')
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    busy.value = false
  }
}
</script>
<template>
  <div class="admin-shell">
    <button
      v-if="mobile"
      class="sidebar-scrim"
      aria-label="Fermer le menu"
      @click="mobile = false"
    ></button>
    <aside class="admin-sidebar" :class="{ open: mobile }">
      <RouterLink class="admin-brand" to="/admin"
        ><span class="school-mark"><Icon name="school" :size="28" /></span
        ><span
          ><strong>{{ school.value.shortName }}</strong><small>Administration</small></span
        ></RouterLink
      >
      <nav aria-label="Administration">
        <p class="nav-section-label">GESTION</p>
        <RouterLink
          v-for="item in items"
          :key="item.to"
          :to="item.to"
          :class="{ active: route.path === item.to }"
          ><Icon :name="item.icon" :size="21" />{{ item.label }}</RouterLink
        ><template v-if="auth.user?.role === 'SUPER_ADMIN'"
          ><p class="nav-section-label">ADMINISTRATION</p>
          <RouterLink
            to="/admin/utilisateurs"
            :class="{ active: route.path === '/admin/utilisateurs' }"
            ><Icon name="users" :size="21" />Utilisateurs</RouterLink
          ></template
        >
      </nav>
      <div class="sidebar-bottom">
        <div class="admin-profile">
          <strong>{{ auth.user?.name }}</strong
          ><small>{{ auth.user?.email }}</small
          ><span class="role-pill">{{
            auth.user?.role === 'SUPER_ADMIN' ? 'Super administrateur' : 'Administrateur'
          }}</span>
        </div>
        <button :disabled="busy" @click="logout">
          <Icon name="logout" :size="19" />Déconnexion</button
        ><RouterLink to="/" class="sidebar-public"
          ><Icon name="external" :size="17" />Voir le site</RouterLink
        >
      </div>
    </aside>
    <div class="admin-main">
      <header class="admin-header">
        <button
          class="icon-button mobile-toggle"
          aria-label="Ouvrir le menu administrateur"
          @click="mobile = !mobile"
        >
          <Icon name="menu" />
        </button>
        <div>
          <small>Espace administratif</small><strong>{{ school.value.name }}</strong>
        </div>
        <div class="admin-header-right">
          <RouterLink class="icon-button" to="/admin/messages" aria-label="Consulter les messages"
            ><Icon name="bell" /></RouterLink
          ><span class="avatar" :title="auth.user?.name">{{
            auth.user?.name?.charAt(0).toUpperCase()
          }}</span>
        </div>
      </header>
      <div class="admin-content">
        <div v-if="error" class="alert error" role="alert">{{ error }}</div>
        <RouterView :key="route.path" />
      </div>
    </div>
  </div>
</template>
