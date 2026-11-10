<script setup lang="ts">
import { computed } from 'vue'
import PageHero from '../../components/PageHero.vue'
import RequestForm from '../../components/RequestForm.vue'
import Icon from '../../components/Icon.vue'
import { school as profile } from '../../config/school'
import { school } from '../../stores/school'
const props = defineProps<{ kind: 'preinscriptions' | 'visites' }>()
const registration = computed(() => props.kind === 'preinscriptions')
</script>
<template>
  <PageHero
    :title="registration ? 'Préinscrire votre enfant' : 'Planifier une visite'"
    :description="
      registration
        ? 'Préparez l’avenir de votre enfant. Complétez ce formulaire pour commencer les démarches de préinscription auprès de notre établissement.'
        : `Venez découvrir le ${school.value.name}, ses espaces et son environnement éducatif. Indiquez le créneau qui vous conviendrait et notre équipe pourra confirmer le rendez-vous.`
    "
    :tag="registration ? 'Rejoindre notre établissement' : 'Découvrez notre établissement'"
  />
  <section class="section soft">
    <div class="container request-layout">
      <RequestForm :kind="kind" />
      <aside class="request-aside">
        <section class="panel">
          <span class="icon-tile"><Icon :name="registration ? 'graduation' : 'users'" /></span>
          <h3>
            {{
              registration ? 'Choisissez le parcours adapté à votre enfant' : 'Échangez avec nous'
            }}
          </h3>
          <p>
            {{
              registration
                ? 'Un accompagnement à chaque étape de sa scolarité.'
                : 'Profitez de la visite pour poser vos questions sur les cycles et le parcours scolaire.'
            }}
          </p>
          <div v-if="registration" class="aside-cycles">
            <RouterLink
              v-for="cycle in profile.cycles"
              :key="cycle.name"
              :to="{ path: '/cycles', query: { cycle: cycle.name } }"
              ><strong>{{ cycle.name }}</strong
              ><Icon name="right" :size="17"
            /></RouterLink>
          </div>
        </section>
        <section class="panel">
          <span class="icon-tile"><Icon name="calendar" /></span>
          <h3>{{ registration ? 'Besoin d’en savoir plus ?' : 'Sur rendez-vous' }}</h3>
          <p>
            {{
              registration
                ? 'Découvrez les documents nécessaires et les modalités d’admission.'
                : 'Choisissez une date qui vous convient. L’administration confirmera ensuite le rendez-vous.'
            }}
          </p>
          <RouterLink class="text-button" :to="registration ? '/admissions' : '/cycles'"
            >{{ registration ? 'Voir les admissions' : 'Découvrir nos cycles'
            }}<Icon name="right" :size="16"
          /></RouterLink>
        </section>
        <section class="aside-blue">
          <Icon name="pin" :size="26" />
          <h3>Nous trouver</h3>
          <p>{{ school.value.address }}</p>
          <a :href="'tel:' + school.value.phone">{{ school.value.phone }}</a>
          <p v-if="school.value.hours" class="small">{{ school.value.hours }}</p>
        </section>
      </aside>
    </div>
  </section>
</template>
