<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { errorMessage, services } from '../../services'
import type { ContentItem } from '../../models'
import { assetUrl, dateLabel } from '../../utils/format'
import Icon from '../../components/Icon.vue'
const route = useRoute(),
  item = ref<ContentItem | null>(null),
  error = ref('')
onMounted(async () => {
  try {
    const id = Number(route.params.id)
    if (!Number.isInteger(id) || id <= 0) throw new Error('Contenu introuvable.')
    item.value = await services.content.getPublished('actualites', id)
  } catch (e) {
    error.value = errorMessage(e)
  }
})
</script>
<template>
  <section class="section">
    <div class="container narrow">
      <RouterLink to="/actualites" class="text-button"
        ><Icon name="left" :size="18" />Toutes les actualités</RouterLink
      >
      <div v-if="error" class="alert error" role="alert">{{ error }}</div>
      <article v-else-if="item" class="article-detail">
        <span class="pill" v-if="item.category">{{ item.category }}</span>
        <h1>{{ item.title }}</h1>
        <p class="muted">{{ dateLabel(item.createdAt) }}</p>
        <img v-if="item.imageUrl" :src="assetUrl(item.imageUrl)" :alt="item.title" />
        <p class="article-summary">{{ item.summary }}</p>
        <div class="prose">{{ item.body }}</div>
      </article>
      <p v-else class="loading"><Icon name="loader" />Chargement…</p>
    </div>
  </section>
</template>
