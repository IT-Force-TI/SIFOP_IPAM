<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { errorMessage, services } from '../../services'
import type { ContentItem, Photo } from '../../models'
import { assetUrl, dateLabel, todayIso } from '../../utils/format'
import PageHero from '../../components/PageHero.vue'
import EmptyState from '../../components/EmptyState.vue'
import Icon from '../../components/Icon.vue'
import PhotoSlider from '../../components/PhotoSlider.vue'

// Galerie et événements viennent de l’API (gérés depuis l’administration).
interface Album {
  id: string
  title: string
  cycle: string
  photos: Photo[]
}
interface SchoolEvent {
  id: number
  title: string
  date: string
  location: string
  tag: string
  summary: string
  photos: Photo[]
}
const tab = ref<'galerie' | 'evenements'>('galerie')
const filters = ['Tous', 'Maternelle', 'Primaire', 'Collège'] as const
const filter = ref<(typeof filters)[number]>('Tous')
const photosData = ref<ContentItem[]>([]),
  eventsData = ref<ContentItem[]>([]),
  loading = ref(true),
  error = ref('')
const allAlbums = computed<Album[]>(() => {
  const map = new Map<string, Album>()
  for (const item of photosData.value) {
    if (!item.imageUrl) continue
    const title = item.album || 'Autres photos'
    if (!map.has(title)) map.set(title, { id: title, title, cycle: item.cycle || '', photos: [] })
    map.get(title)!.photos.push({ src: assetUrl(item.imageUrl), alt: item.title })
  }
  return [...map.values()]
})
// Seuls les cycles qui ont des photos sont proposés dans le filtre.
const availableFilters = computed(() =>
  filters.filter((f) => f === 'Tous' || allAlbums.value.some((a) => a.cycle === f)),
)
const albums = computed(() =>
  allAlbums.value.filter((a) => filter.value === 'Tous' || a.cycle === filter.value),
)
const events = computed<SchoolEvent[]>(() =>
  eventsData.value.map((e) => ({
    id: e.id,
    title: e.title,
    date: e.eventDate,
    location: e.location,
    tag: e.category,
    summary: e.summary,
    photos: e.imageUrl ? [{ src: assetUrl(e.imageUrl), alt: e.title }] : [],
  })),
)
const today = todayIso()
const upcoming = computed(() =>
  events.value.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date)),
)
const past = computed(() =>
  events.value.filter((e) => e.date < today).sort((a, b) => b.date.localeCompare(a.date)),
)
async function load() {
  loading.value = true
  error.value = ''
  try {
    const [photos, evts] = await Promise.all([
      services.content.listPublished('galerie'),
      services.content.listPublished('evenements'),
    ])
    photosData.value = photos
    eventsData.value = evts
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    loading.value = false
  }
}
onMounted(load)
</script>
<template>
  <PageHero
    title="La vie de notre école"
    description="Découvrez les activités, les événements et les moments partagés au sein de notre établissement."
    tag="Médias"
  />
  <section class="section">
    <div class="container">
      <div class="cycle-tabs">
        <button
          :class="{ active: tab === 'galerie' }"
          :aria-pressed="tab === 'galerie'"
          @click="tab = 'galerie'"
        >
          <Icon name="images" />Galerie photos</button
        ><button
          :class="{ active: tab === 'evenements' }"
          :aria-pressed="tab === 'evenements'"
          @click="tab = 'evenements'"
        >
          <Icon name="calendar" />Événements
        </button>
      </div>
      <div v-if="error" class="alert error" role="alert">
        {{ error }} <button class="text-button" @click="load">Réessayer</button>
      </div>
      <p v-if="loading" class="loading"><Icon name="loader" />Chargement…</p>
      <template v-else-if="tab === 'galerie'">
        <div class="filter-pills" role="group" aria-label="Filtrer par cycle">
          <button
            v-for="f in availableFilters"
            :key="f"
            type="button"
            :class="{ active: filter === f }"
            :aria-pressed="filter === f"
            @click="filter = f"
          >
            {{ f }}
          </button>
        </div>
        <EmptyState
          v-if="!albums.length && !error"
          title="Aucune photo pour le moment"
          description="Les photos de l’établissement apparaîtront ici."
          icon="images"
        />
        <div v-else class="album-grid">
          <article v-for="album in albums" :key="album.id" class="album-card">
            <PhotoSlider :photos="album.photos" :label="album.title" />
            <div class="album-body">
              <h3>{{ album.title }}</h3>
              <p>{{ album.cycle ? album.cycle + ' · ' : '' }}{{ album.photos.length }} photo(s)</p>
            </div>
          </article>
        </div>
      </template>
      <template v-else>
        <EmptyState
          v-if="!events.length && !error"
          title="Aucun événement pour le moment"
          description="Les prochains rendez-vous de l’école apparaîtront ici."
          icon="calendar"
        />
        <template v-for="group in [{ label: 'Prochains événements', items: upcoming }, { label: 'Événements passés', items: past }]" :key="group.label">
          <template v-if="group.items.length">
            <h2 class="event-heading">{{ group.label }}</h2>
            <div class="event-list">
              <article v-for="event in group.items" :key="event.id" class="event-card">
                <PhotoSlider v-if="event.photos.length" :photos="event.photos" :label="event.title" />
                <div class="event-body">
                  <div class="event-top">
                    <span class="event-date"><Icon name="calendar" :size="15" />{{ dateLabel(event.date) }}</span>
                    <span v-if="event.tag" class="event-tag">{{ event.tag }}</span>
                  </div>
                  <h3>{{ event.title }}</h3>
                  <p v-if="event.location" class="with-icon"><Icon name="pin" :size="16" />{{ event.location }}</p>
                  <p>{{ event.summary }}</p>
                </div>
              </article>
            </div>
          </template>
        </template>
      </template>
    </div>
  </section>
</template>
