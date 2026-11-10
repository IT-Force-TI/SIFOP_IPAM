<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import Icon from './Icon.vue'
defineProps<{ title: string; wide?: boolean }>()
const emit = defineEmits<{ close: [] }>()
const box = ref<HTMLElement>()
const previous = document.activeElement as HTMLElement | null
const onKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape') emit('close')
  if (e.key !== 'Tab') return
  const nodes = box.value?.querySelectorAll<HTMLElement>(
    'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href]',
  )
  if (!nodes?.length) return
  const first = nodes[0]!,
    last = nodes[nodes.length - 1]!
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault()
    last.focus()
  }
  if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault()
    first.focus()
  }
}
onMounted(() => {
  document.body.style.overflow = 'hidden'
  document.addEventListener('keydown', onKey)
  box.value?.querySelector<HTMLElement>('input,button')?.focus()
})
onBeforeUnmount(() => {
  document.body.style.overflow = ''
  document.removeEventListener('keydown', onKey)
  previous?.focus()
})
</script>
<template>
  <Teleport to="body"
    ><div class="modal-overlay" @mousedown.self="emit('close')">
      <section
        ref="box"
        class="modal"
        :class="{ wide }"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <header>
          <h2 id="modal-title">{{ title }}</h2>
          <button class="icon-button" type="button" aria-label="Fermer" @click="emit('close')">
            <Icon name="close" />
          </button>
        </header>
        <div class="modal-body"><slot /></div>
      </section></div
  ></Teleport>
</template>
