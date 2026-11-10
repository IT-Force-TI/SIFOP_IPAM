<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { school as profile } from '../config/school'
import { school, loadSettings } from '../stores/school'
import Icon from '../components/Icon.vue'
const route = useRoute()
const mobile = ref(false)
const admissions = ref(false)
const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
watch(
  () => route.fullPath,
  () => {
    mobile.value = false
    admissions.value = false
  },
)
onMounted(loadSettings)
const links = [
  { to: '/', label: 'Accueil' },
  { to: '/cycles', label: 'Nos cycles' },
  { to: '/actualites', label: 'Actualités' },
  { to: '/medias', label: 'Médias' },
]
</script>
<template>
  <a href="#main-content" class="skip-link">Aller au contenu</a>
  <header class="public-header">
    <div class="nav-container">
      <RouterLink to="/" class="brand" :aria-label="`${school.value.shortName} — Accueil`"
        ><img :src="profile.logo" :alt="`Logo ${school.value.shortName}`" /><span
          ><strong>{{ school.value.name }}</strong
          ><small v-if="school.value.slogan">{{ school.value.slogan }}</small></span
        ></RouterLink
      >
      <button
        class="icon-button mobile-toggle"
        aria-label="Ouvrir le menu"
        :aria-expanded="mobile"
        @click="mobile = !mobile"
      >
        <Icon :name="mobile ? 'close' : 'menu'" />
      </button>
      <nav aria-label="Navigation principale" :class="{ open: mobile }">
        <RouterLink to="/" :class="{ active: route.path === '/' }">Accueil</RouterLink>
        <RouterLink to="/cycles" :class="{ active: route.path === '/cycles' }"
          >Nos cycles</RouterLink
        >
        <div class="nav-dropdown" @keydown.esc="admissions = false">
          <button
            class="nav-link"
            :class="{ active: route.path.startsWith('/admissions') }"
            :aria-expanded="admissions"
            @click="admissions = !admissions"
          >
            Admissions <Icon name="chevron" :size="15" />
          </button>
          <div v-if="admissions" class="dropdown-menu">
            <RouterLink
              v-for="cycle in profile.cycles"
              :key="cycle.slug"
              :to="`/admissions/${cycle.slug}`"
              >{{ cycle.name }}</RouterLink
            >
          </div>
        </div>
        <RouterLink to="/actualites" :class="{ active: route.path.startsWith('/actualites') }"
          >Actualités</RouterLink
        >
        <RouterLink to="/medias" :class="{ active: route.path === '/medias' }">Médias</RouterLink>
        <div class="nav-actions">
          <RouterLink to="/rendez-vous" class="btn green"
            ><Icon name="calendar" :size="18" /> Prendre RDV</RouterLink
          ><RouterLink to="/preinscription" class="btn"
            ><Icon name="register" :size="18" /> Préinscription</RouterLink
          >
        </div>
      </nav>
    </div>
  </header>
  <div v-if="school.error" class="global-error" role="alert">
    {{ school.error }} <button class="text-button" @click="loadSettings">Réessayer</button>
  </div>
  <main id="main-content"><RouterView :key="route.path" /></main>
  <footer class="public-footer">
    <div class="container footer-grid">
      <div>
        <div class="footer-brand">
          <img :src="profile.logo" alt="" /><span
            ><strong>{{ school.value.shortName }}</strong
            ><small>{{ school.value.name }}</small></span
          >
        </div>
        <p>{{ profile.footerText }}</p>
        <em v-if="school.value.slogan">« {{ school.value.slogan }} »</em>
      </div>
      <div>
        <h3>Liens rapides</h3>
        <RouterLink v-for="link in links" :key="link.to" :to="link.to">{{ link.label }}</RouterLink
        ><RouterLink to="/admissions">Admissions</RouterLink
        ><RouterLink to="/rendez-vous">Prendre rendez-vous</RouterLink
        ><RouterLink to="/preinscription">Préinscription</RouterLink>
      </div>
      <div>
        <h3>Contact</h3>
        <p class="with-icon"><Icon name="pin" :size="16" />{{ school.value.address }}</p>
        <a class="with-icon" :href="'tel:' + school.value.phone"
          ><Icon name="phone" :size="16" />{{ school.value.phone }}</a
        ><a v-if="school.value.phone2" class="with-icon" :href="'tel:' + school.value.phone2"
          ><Icon name="phone" :size="16" />{{ school.value.phone2 }}</a
        ><a v-if="school.value.email" class="with-icon" :href="'mailto:' + school.value.email"
          ><Icon name="mail" :size="16" />{{ school.value.email }}</a
        >
        <p v-if="school.value.hours" class="with-icon">
          <Icon name="clock" :size="16" />{{ school.value.hours }}
        </p>
      </div>
      <div>
        <h3>Suivez-nous</h3>
        <p>Retrouvez les actualités et activités de l’établissement sur nos réseaux sociaux.</p>
        <p>Les réseaux sociaux seront bientôt disponibles.</p>
      </div>
    </div>
    <div class="container footer-bottom">
      <span>© {{ new Date().getFullYear() }} {{ school.value.name }}. Tous droits réservés.</span>
      <div>
        <RouterLink to="/">Accueil</RouterLink
        ><RouterLink to="/admin/connexion">Administration</RouterLink>
      </div>
    </div>
  </footer>
  <button class="back-top" aria-label="Retour en haut" @click="scrollTop">
    <Icon name="up" :size="19" />
  </button>
</template>
