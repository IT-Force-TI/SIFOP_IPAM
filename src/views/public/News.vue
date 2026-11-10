<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { errorMessage, services } from '../../services'
import type { ContentItem } from '../../models'
import { assetUrl, dateLabel } from '../../utils/format'
import PageHero from '../../components/PageHero.vue'
import EmptyState from '../../components/EmptyState.vue'
import Icon from '../../components/Icon.vue'
import { school } from '../../stores/school'
const items = ref<ContentItem[]>([]),
  error = ref(''),
  loading = ref(true),
  category = ref('')
const categories = computed(() => [...new Set(items.value.map((x) => x.category).filter(Boolean))])
const filtered = computed(() =>
  items.value.filter((x) => !category.value || x.category === category.value),
)
async function load() {
  loading.value = true
  error.value = ''
  try {
    items.value = await services.content.listPublished('actualites')
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
    title="Actualités de l’établissement"
    :description="`Retrouvez les nouvelles et les temps forts du ${school.value.name}.`"
  />
  <section class="section soft">
    <div class="container">
      <div v-if="error" class="alert error" role="alert">
        {{ error }} <button class="text-button" @click="load">Réessayer</button>
      </div>
      <p v-if="loading" class="loading"><Icon name="loader" />Chargement des actualités…</p>
      <template v-else
        ><div v-if="categories.length" class="filter-row">
          <label
            >Catégorie<select v-model="category">
              <option value="">Toutes les catégories</option>
              <option v-for="cat in categories" :key="cat">{{ cat }}</option>
            </select></label
          >
        </div>
        <EmptyState
          v-if="!filtered.length && !error"
          title="Aucune actualité publiée pour le moment"
          description="Les nouvelles de l’établissement apparaîtront ici."
          icon="news" />
        <div v-else class="news-grid">
          <article class="panel news-card" v-for="item in filtered" :key="item.id">
            <img v-if="item.imageUrl" :src="assetUrl(item.imageUrl)" :alt="item.title" />
            <div class="news-body">
              <div class="news-meta">
                <span class="pill" v-if="item.category">{{ item.category }}</span
                ><time>{{ dateLabel(item.createdAt) }}</time>
              </div>
              <h2>{{ item.title }}</h2>
              <p>{{ item.summary }}</p>
              <RouterLink :to="'/actualites/' + item.id" class="text-button"
                >Lire l’article <Icon name="right" :size="17"
              /></RouterLink>
            </div>
          </article></div
      ></template>
    </div>
  </section>
</template>
