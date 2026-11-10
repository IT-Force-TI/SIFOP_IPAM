<script setup lang="ts">
import { computed, ref } from 'vue'
import Icon from './Icon.vue'
import type { Photo } from '../models'
const props = defineProps<{ photos: Photo[]; label: string }>()
const index = ref(0)
const count = computed(() => props.photos.length)
function go(i: number) {
  index.value = (i + count.value) % count.value
}
let startX = 0
function onStart(e: TouchEvent) {
  startX = e.touches[0].clientX
}
function onEnd(e: TouchEvent) {
  const dx = e.changedTouches[0].clientX - startX
  if (Math.abs(dx) > 40) go(index.value + (dx < 0 ? 1 : -1))
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'ArrowLeft') go(index.value - 1)
  if (e.key === 'ArrowRight') go(index.value + 1)
}
</script>
<template>
  <div
    class="slider"
    role="group"
    aria-roledescription="carrousel"
    :aria-label="label"
    tabindex="0"
    @keydown="onKey"
    @touchstart.passive="onStart"
    @touchend.passive="onEnd"
  >
    <div class="slider-track" :style="{ transform: `translateX(-${index * 100}%)` }">
      <figure
        v-for="(photo, i) in photos"
        :key="photo.src + i"
        class="slider-slide"
        :aria-hidden="i !== index"
      >
        <img :src="photo.src" :alt="photo.alt" loading="lazy" />
      </figure>
    </div>
    <template v-if="count > 1">
      <button type="button" class="slider-btn prev" aria-label="Photo précédente" @click="go(index - 1)">
        <Icon name="left" :size="18" />
      </button>
      <button type="button" class="slider-btn next" aria-label="Photo suivante" @click="go(index + 1)">
        <Icon name="right" :size="18" />
      </button>
      <div class="slider-dots">
        <button
          v-for="(photo, i) in photos"
          :key="photo.src + i"
          type="button"
          :class="{ active: i === index }"
          :aria-label="`Afficher la photo ${i + 1}`"
          @click="go(i)"
        ></button>
      </div>
    </template>
    <span class="slider-count">{{ index + 1 }} / {{ count }}</span>
  </div>
</template>
