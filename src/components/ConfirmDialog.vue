<script setup lang="ts">
import Modal from './Modal.vue'
defineProps<{ title?: string; message: string; busy?: boolean }>()
defineEmits<{ close: []; confirm: [] }>()
</script>
<template>
  <Modal :title="title || 'Confirmer la suppression'" @close="$emit('close')"
    ><p>{{ message }}</p>
    <p class="muted">Cette action est définitive.</p>
    <div class="form-actions">
      <button class="btn light" :disabled="busy" @click="$emit('close')">Annuler</button
      ><button class="btn danger" :disabled="busy" @click="$emit('confirm')">
        {{ busy ? 'Suppression…' : 'Supprimer' }}
      </button>
    </div></Modal
  >
</template>
