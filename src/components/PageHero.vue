<script setup lang="ts">
import Icon from './Icon.vue'
defineProps<{ title: string; description?: string; tag?: string; purple?: boolean }>()
</script>
<template>
  <section class="page-hero" :class="{ purple }">
    <div class="container">
      <RouterLink class="back-link" to="/"
        ><Icon name="left" :size="15" /> Retour à l’accueil</RouterLink
      >
      <span v-if="tag" class="hero-tag">{{ tag }}</span>
      <h1>{{ title }}</h1>
      <p v-if="description">{{ description }}</p>
      <slot />
    </div>
  </section>
</template>
