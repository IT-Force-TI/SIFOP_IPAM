<script setup lang="ts">
import { computed } from 'vue'
import PageHero from '../../components/PageHero.vue'
import Icon from '../../components/Icon.vue'
import { school as profile } from '../../config/school'
const props = defineProps<{ cycle?: string }>()
const cycles = profile.cycles
const selectedCycle = computed(() => cycles.find((item) => item.name === props.cycle))
const description = computed(() =>
  selectedCycle.value
    ? `Préparez l’admission de votre enfant en ${selectedCycle.value.name.toLowerCase()} (${selectedCycle.value.age}). Découvrez les documents et les étapes à prévoir.`
    : 'Retrouvez les informations utiles pour préparer l’admission de votre enfant, de la maternelle au collège.',
)
const documents = profile.admissions.documents
const services = [
  {
    icon: 'book',
    name: 'Accompagnement pédagogique',
    text: 'Un suivi adapté à l’âge et au rythme de chaque enfant.',
  },
  {
    icon: 'users',
    name: 'Activités d’éveil',
    text: 'Des activités variées, culturelles, sportives et artistiques.',
  },
  {
    icon: 'shield',
    name: 'Cadre sécurisé',
    text: 'Un environnement propice aux apprentissages et au bien-être.',
  },
  {
    icon: 'heart',
    name: 'Suivi personnel',
    text: 'Une relation de confiance avec les élèves et leurs familles.',
  },
]
</script>
<template>
  <PageHero
    :title="selectedCycle ? `Admission en ${selectedCycle.name}` : 'Admissions'"
    :description="description"
    tag="Admissions"
    ><div class="hero-actions">
      <RouterLink
        :to="selectedCycle ? { path: '/preinscription', query: { cycle: selectedCycle.name } } : '/preinscription'"
        class="btn white"
        >Se préinscrire <Icon name="right" :size="17" /></RouterLink
      ><RouterLink to="/rendez-vous" class="btn outline-white">Planifier une visite</RouterLink>
    </div></PageHero
  >
  <section class="section">
    <div class="container admissions-grid">
      <div>
        <div v-if="selectedCycle" class="class-note">
          <strong>{{ selectedCycle.name }} · {{ selectedCycle.age }}</strong>
          <p>{{ selectedCycle.classes.join(' · ') }}</p>
        </div>
        <span class="pill">Dossier</span>
        <h2>Documents requis</h2>
        <ul class="document-list">
          <li v-for="doc in documents" :key="doc">
            <Icon name="badge" :size="20" /><span>{{ doc }}</span>
          </li>
        </ul>
        <div class="info-note">
          <Icon name="info" />
          <p>
            Le dossier complet est à déposer auprès du secrétariat. La préinscription en ligne
            permet de préparer votre demande et ne vaut pas admission définitive.
          </p>
        </div>
        <RouterLink to="/tarifs" class="btn light"
          >Consulter les tarifs <Icon name="right" :size="17"
        /></RouterLink>
      </div>
      <div>
        <span class="pill">Expérience scolaire</span>
        <h2>Ce que comprend l’accompagnement</h2>
        <div class="service-grid">
          <article class="panel" v-for="service in services" :key="service.name">
            <span class="icon-tile"><Icon :name="service.icon" /></span>
            <h3>{{ service.name }}</h3>
            <p>{{ service.text }}</p>
          </article>
        </div>
      </div>
    </div>
  </section>
  <section class="section soft">
    <div class="container">
      <div class="section-heading">
        <h2>Les étapes de l’admission</h2>
        <p>Un parcours simple, avec une équipe à vos côtés.</p>
      </div>
      <div class="steps-grid">
        <article
          v-for="(step, i) in [
            {
              title: 'Prenez contact',
              text: 'Découvrez nos cycles et échangez avec le secrétariat.',
            },
            {
              title: 'Préinscrivez votre enfant',
              text: 'Complétez le formulaire et préparez les pièces du dossier.',
            },
            {
              title: 'Finalisez l’inscription',
              text: 'Après étude de la demande, l’école vous accompagne pour la suite.',
            },
          ]"
          :key="step.title"
        >
          <span class="step-number">{{ i + 1 }}</span>
          <h3>{{ step.title }}</h3>
          <p>{{ step.text }}</p>
        </article>
      </div>
    </div>
  </section>
</template>
