<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHero from '../../components/PageHero.vue'
import Icon from '../../components/Icon.vue'
import { school as profile } from '../../config/school'
const route = useRoute(),
  router = useRouter()
const cycles = profile.cycles
const selected = computed(() => cycles.find((c) => c.name === route.query.cycle) || cycles[0]!)
</script>
<template>
  <PageHero
    title="Nos cycles scolaires"
    description="Un parcours éducatif complet, de la maternelle au collège, pour accompagner chaque enfant vers la réussite."
    tag="Apprendre et grandir"
  />
  <section class="section">
    <div class="container">
      <div class="cycle-tabs" role="group" aria-label="Choisir un cycle">
        <button
          v-for="cycle in cycles"
          :key="cycle.name"
          :class="{ active: selected.name === cycle.name }"
          :aria-pressed="selected.name === cycle.name"
          @click="router.replace({ query: { cycle: cycle.name } })"
        >
          {{ cycle.name }}
        </button>
      </div>
      <div class="cycle-grid">
        <div>
          <span class="pill"><Icon name="users" :size="15" />{{ selected.age }}</span>
          <h2>Cycle {{ selected.name }}</h2>
          <p>{{ selected.text }}</p>
          <ul class="check-list">
            <li v-for="skill in selected.skills" :key="skill">
              <Icon name="checks" :size="19" />{{ skill }}
            </li>
          </ul>
          <div class="class-note">
            <strong>Les classes</strong>
            <p>{{ selected.classes.join(' · ') }}</p>
          </div>
          <RouterLink class="btn" :to="{ path: '/preinscription', query: { cycle: selected.name } }"
            >Préinscrire mon enfant <Icon name="right" :size="17"
          /></RouterLink>
        </div>
        <aside class="program-panel">
          <h3>Programme et activités</h3>
          <article v-for="program in selected.programs" :key="program.title">
            <span class="icon-tile"><Icon :name="program.icon" /></span>
            <div>
              <h4>{{ program.title }}</h4>
              <p>{{ program.text }}</p>
            </div>
          </article>
        </aside>
      </div>
      <div class="inline-cta">
        <h2>Quel cycle correspond à votre enfant ?</h2>
        <p>
          Notre équipe est disponible pour vous renseigner sur les programmes, les niveaux et les
          modalités d’inscription.
        </p>
        <div class="hero-actions">
          <RouterLink class="btn white" to="/rendez-vous">Planifier une visite</RouterLink
          ><RouterLink class="btn outline-white" to="/preinscription">Se préinscrire</RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>
