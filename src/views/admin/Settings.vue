<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { errorMessage, services } from '../../services'
import type { Settings } from '../../models'
import { school } from '../../stores/school'
import Icon from '../../components/Icon.vue'
const form = ref<Settings | null>(null),
  error = ref(''),
  success = ref(''),
  busy = ref(false)
async function load() {
  error.value = ''
  try {
    form.value = await services.settings.get()
  } catch (e) {
    error.value = errorMessage(e)
  }
}
async function save() {
  busy.value = true
  error.value = ''
  success.value = ''
  try {
    if (!form.value) return
    const saved = await services.settings.update(form.value)
    school.value = saved
    success.value = 'Paramètres enregistrés.'
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    busy.value = false
  }
}
onMounted(load)
</script>
<template>
  <div class="page-heading">
    <div>
      <span class="eyebrow">CONFIGURATION</span>
      <h1>Paramètres de l’établissement</h1>
      <p>
        Gérez les informations générales utilisées sur le site du {{ school.value.name }}.
      </p>
    </div>
  </div>
  <div v-if="error" role="alert" class="alert error">
    {{ error }} <button v-if="!form" class="text-button" @click="load">Réessayer</button>
  </div>
  <div v-if="success" role="status" class="alert success">{{ success }}</div>
  <form v-if="form" class="settings-form" @submit.prevent="save">
    <section class="panel form-section">
      <h2>
        <span class="icon-tile"><Icon name="school" /></span>Identité de l’établissement
      </h2>
      <p>Nom, sigle, slogan et identité visuelle.</p>
      <div class="form-grid">
        <label
          >Nom de l’établissement <span class="required">*</span
          ><input v-model="form.name" required maxlength="200" /></label
        ><label
          >Nom court / sigle <span class="required">*</span
          ><input v-model="form.shortName" required maxlength="60" /></label
        ><label class="full"
          >Slogan <span class="required">*</span
          ><input v-model="form.slogan" required maxlength="200"
        /></label>
      </div>
    </section>
    <section class="panel form-section">
      <h2>
        <span class="icon-tile"><Icon name="phone" /></span>Coordonnées et horaires
      </h2>
      <p>Les informations de contact affichées aux familles.</p>
      <div class="form-grid">
        <label class="full"
          >Adresse <span class="required">*</span
          ><input v-model="form.address" required maxlength="300" /></label
        ><label
          >Email <span class="required">*</span
          ><input v-model="form.email" type="email" required maxlength="254" /></label
        ><label
          >Téléphone principal <span class="required">*</span
          ><input v-model="form.phone" type="tel" required maxlength="40" /></label
        ><label>Second téléphone<input v-model="form.phone2" type="tel" maxlength="40" /></label
        ><label
          >Horaires <span class="required">*</span
          ><input v-model="form.hours" required maxlength="200"
        /></label>
      </div>
    </section>
    <section class="panel form-section">
      <h2>
        <span class="icon-tile"><Icon name="wallet" /></span>Tarifs et scolarité
      </h2>
      <p>Montants en francs CFA, affichés sur la page des tarifs.</p>
      <div class="form-grid">
        <label
          >Scolarité annuelle (FCFA)<input
            v-model.number="form.annualFee"
            type="number"
            min="0"
            max="100000000"
            required /></label
        ><label
          >Cantine / jour (FCFA)<input
            v-model.number="form.canteenFee"
            type="number"
            min="0"
            max="1000000"
            required /></label
        ><label
          >Badge (FCFA)<input
            v-model.number="form.badgeFee"
            type="number"
            min="0"
            max="1000000"
            required /></label
        ><label
          >Lacoste (FCFA)<input
            v-model.number="form.uniformFee"
            type="number"
            min="0"
            max="1000000"
            required /></label
        ><label
          >APE (FCFA)<input
            v-model.number="form.apeFee"
            type="number"
            min="0"
            max="1000000"
            required
        /></label>
      </div>
    </section>
    <div class="settings-save">
      <button class="btn" :disabled="busy">
        <Icon :name="busy ? 'loader' : 'save'" :size="18" />{{
          busy ? 'Enregistrement…' : 'Enregistrer les paramètres'
        }}
      </button>
    </div>
  </form>
  <p v-else-if="!error" class="loading"><Icon name="loader" />Chargement des paramètres…</p>
</template>
