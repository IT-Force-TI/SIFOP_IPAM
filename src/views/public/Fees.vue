<script setup lang="ts">
import { computed } from 'vue'
import { school } from '../../stores/school'
import { money } from '../../utils/format'
/** Montant non renseigné (0) : rien n'est inventé, l'établissement communique le tarif. */
const amount = (n: number, suffix = '') => (n > 0 ? money(n) + suffix : 'Sur demande')
import PageHero from '../../components/PageHero.vue'
import Icon from '../../components/Icon.vue'
const fees = computed(() =>
  [
  {
    icon: 'wallet',
    title: 'Scolarité annuelle',
    amount: amount(school.value.annualFee),
    text: 'Possibilité de paiement en trois tranches.',
  },
  {
    icon: 'utensils',
    title: 'Cantine scolaire',
    amount: amount(school.value.canteenFee, ' / jour'),
    text: 'Service de restauration disponible pendant les jours de classe.',
  },
  {
    icon: 'badge',
    title: 'Frais de Badge',
    amount: amount(school.value.badgeFee),
    text: 'Payables lors de la validation définitive de l’inscription.',
  },
  {
    icon: 'shirt',
    title: 'Frais de Lacoste',
    amount: amount(school.value.uniformFee),
    text: 'La tenue de l’établissement pour accompagner la vie scolaire.',
  },
  {
    icon: 'file',
    title: 'APE',
    amount: amount(school.value.apeFee),
    text: 'Participation à l’Association des Parents d’Élèves.',
  },
  ].map((fee, i) => {
    const value = [
      school.value.annualFee,
      school.value.canteenFee,
      school.value.badgeFee,
      school.value.uniformFee,
      school.value.apeFee,
    ][i]
    // Tarif non renseigné : pas de description propre à un autre établissement.
    return value > 0 ? fee : { ...fee, text: 'Renseignez-vous auprès de l’établissement.' }
  }),
)
</script>
<template>
  <PageHero
    title="Tarifs et scolarité"
    description="Retrouvez les frais de scolarité et les services proposés par notre établissement."
    tag="Informations pratiques"
    purple
  />
  <section class="section soft">
    <div class="container">
      <div class="fees-grid">
        <article class="fee-card panel" v-for="fee in fees" :key="fee.title">
          <span class="icon-tile"><Icon :name="fee.icon" :size="28" /></span>
          <h2>{{ fee.title }}</h2>
          <strong>{{ fee.amount }}</strong>
          <p>{{ fee.text }}</p>
        </article>
      </div>
      <div class="info-note">
        <Icon name="wallet" />
        <p>
          Le secrétariat vous précisera les échéances de paiement et les conditions applicables à
          votre dossier. Pour toute question,
          <RouterLink to="/#contact">contactez-nous</RouterLink>.
        </p>
      </div>
      <div class="center actions">
        <RouterLink class="btn" to="/preinscription">Préinscrire mon enfant</RouterLink
        ><RouterLink class="btn light" to="/rendez-vous">Rencontrer notre équipe</RouterLink>
      </div>
    </div>
  </section>
</template>
