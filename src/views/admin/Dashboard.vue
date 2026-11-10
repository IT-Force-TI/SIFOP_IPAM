<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { errorMessage, services } from '../../services'
import type { DashboardData } from '../../models'
import { dateLabel, statusLabels } from '../../utils/format'
import Icon from '../../components/Icon.vue'
import EmptyState from '../../components/EmptyState.vue'
const data = ref<DashboardData | null>(null),
  error = ref('')
const cards = [
  { kind: 'actualites', label: 'Actualités', icon: 'news' },
  { kind: 'evenements', label: 'Événements', icon: 'calendar' },
  { kind: 'galerie', label: 'Galerie', icon: 'images' },
  { kind: 'preinscriptions', label: 'Préinscriptions', icon: 'file' },
  { kind: 'visites', label: 'Visites', icon: 'calendar' },
] as const
function subtitle(kind: (typeof cards)[number]['kind']) {
  if (!data.value) return ''
  const value = data.value[kind]
  if ('pending' in value) return value.pending + ' en attente'
  if (kind === 'galerie') return 'Photos générales'
  return value.published + ' publié(s)'
}
async function load() {
  error.value = ''
  try {
    data.value = await services.dashboard.get()
  } catch (e) {
    error.value = errorMessage(e)
  }
}
onMounted(load)
</script>
<template>
  <div class="page-heading">
    <div>
      <span class="eyebrow">VUE D’ENSEMBLE</span>
      <h1>Tableau de bord</h1>
      <p>Bienvenue dans l’espace de gestion de votre établissement.</p>
    </div>
    <RouterLink to="/" class="btn light"
      ><Icon name="external" :size="17" />Voir le site</RouterLink
    >
  </div>
  <div v-if="error" class="alert error" role="alert">
    {{ error }} <button class="text-button" @click="load">Réessayer</button>
  </div>
  <template v-else-if="data"
    ><div class="stat-grid">
      <RouterLink
        v-for="card in cards"
        :key="card.kind"
        :to="'/admin/' + card.kind"
        class="panel stat-card"
        ><span class="stat-top"
          ><span class="icon-tile"><Icon :name="card.icon" :size="25" /></span
          ><Icon name="right" :size="20" /></span
        ><span>{{ card.label }}</span
        ><strong>{{ data[card.kind].total }}</strong
        ><small>{{ subtitle(card.kind) }}</small></RouterLink
      >
    </div>
    <div class="dashboard-lists">
      <section class="panel">
        <header class="panel-heading">
          <div>
            <h2>Dernières préinscriptions</h2>
            <p>Demandes récemment reçues</p>
          </div>
          <RouterLink to="/admin/preinscriptions">Voir tout</RouterLink>
        </header>
        <EmptyState
          v-if="!data.recentRegistrations.length"
          title="Aucune préinscription reçue"
          icon="file"
        />
        <div v-else class="recent-list">
          <RouterLink
            v-for="item in data.recentRegistrations"
            :key="item.id"
            to="/admin/preinscriptions"
            ><div>
              <strong>{{ item.firstName }} {{ item.lastName }}</strong
              ><small>Responsable : {{ item.parentName }}</small>
            </div>
            <div>
              <span class="pill">{{ item.cycle }}</span
              ><span class="status-pill" :class="item.status.toLowerCase()">{{
                statusLabels[item.status]
              }}</span>
            </div></RouterLink
          >
        </div>
      </section>
      <section class="panel">
        <header class="panel-heading">
          <div>
            <h2>Dernières demandes de visite</h2>
            <p>Rendez-vous récemment demandés</p>
          </div>
          <RouterLink to="/admin/visites">Voir tout</RouterLink>
        </header>
        <EmptyState
          v-if="!data.recentVisits.length"
          title="Aucune demande de visite reçue"
          icon="calendar"
        />
        <div v-else class="recent-list">
          <RouterLink v-for="item in data.recentVisits" :key="item.id" to="/admin/visites"
            ><div>
              <strong>{{ item.parentName }}</strong
              ><small>{{ dateLabel(item.visitDate) }} à {{ item.slot }}</small>
            </div>
            <span class="status-pill" :class="item.status.toLowerCase()">{{
              statusLabels[item.status]
            }}</span></RouterLink
          >
        </div>
      </section>
    </div></template
  >
  <p v-else class="loading"><Icon name="loader" />Chargement du tableau de bord…</p>
</template>
