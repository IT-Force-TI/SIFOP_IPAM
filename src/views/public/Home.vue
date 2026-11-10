<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import Icon from '../../components/Icon.vue'
import { school as profile } from '../../config/school'
import { errorMessage, services } from '../../services'
import { school } from '../../stores/school'

// --- Héros : carrousel d'images (profil de l'établissement) ---
const heroSlides = profile.hero.images
const heroIndex = ref(0)
let heroTimer: number | undefined
function stopHero() {
  if (heroTimer) window.clearInterval(heroTimer)
  heroTimer = undefined
}
function startHero() {
  stopHero()
  if (heroSlides.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    return
  heroTimer = window.setInterval(() => {
    heroIndex.value = (heroIndex.value + 1) % heroSlides.length
  }, 6000)
}
function goHero(i: number) {
  heroIndex.value = i
  startHero()
}
onMounted(startHero)
onBeforeUnmount(stopHero)

const openFaq = ref<number | null>(null)

// --- Formulaire « Nous contacter » ---
const form = ref({ parentName: '', email: '', phone: '', message: '' })
const busy = ref(false),
  error = ref(''),
  success = ref('')
async function contact() {
  busy.value = true
  error.value = ''
  success.value = ''
  try {
    const result = await services.requests.submit('messages', form.value)
    success.value = 'Message envoyé. Référence : ' + result.reference
    form.value = { parentName: '', email: '', phone: '', message: '' }
  } catch (e) {
    error.value = errorMessage(e, true)
  } finally {
    busy.value = false
  }
}
</script>
<template>
  <section class="home-hero" @mouseenter="stopHero" @mouseleave="startHero">
    <div class="hero-slides" aria-hidden="true">
      <div
        v-for="(src, i) in heroSlides"
        :key="src"
        class="hero-slide"
        :class="{ active: i === heroIndex }"
        :style="{ backgroundImage: `url(${src})` }"
      ></div>
    </div>
    <div class="hero-overlay" aria-hidden="true"></div>
    <div class="container">
      <p class="hero-eyebrow">{{ profile.hero.eyebrow }}</p>
      <h1>
        <template v-for="line in profile.hero.titleLines" :key="line">{{ line }}<br /></template
        ><span>{{ profile.hero.highlight }}</span>
      </h1>
      <p class="hero-intro">{{ profile.hero.intro }}</p>
      <div class="hero-actions">
        <RouterLink class="btn white" to="/cycles"
          >Découvrir nos cycles <Icon name="right" :size="18" /></RouterLink
        ><RouterLink class="btn outline-white" to="/preinscription">Se préinscrire</RouterLink>
      </div>
    </div>
    <div v-if="heroSlides.length > 1" class="hero-dots">
      <button
        v-for="(src, i) in heroSlides"
        :key="src"
        type="button"
        :class="{ active: i === heroIndex }"
        :aria-label="`Afficher l’image ${i + 1} sur ${heroSlides.length}`"
        @click="goHero(i)"
      ></button>
    </div>
  </section>
  <section class="section">
    <div class="container founder-grid">
      <figure class="founder-photo">
        <img :src="profile.founder.photo" :alt="profile.founder.photoAlt" width="538" height="538" />
      </figure>
      <div>
        <span class="eyebrow">{{ profile.founder.eyebrow }}</span>
        <h2>
          <template v-for="(line, i) in profile.founder.titleLines" :key="line"
            ><br v-if="i" />{{ line }}</template
          >
        </h2>
        <p>{{ profile.founder.greeting }}</p>
        <p v-for="text in profile.founder.paragraphs" :key="text">{{ text }}</p>
        <strong>{{ profile.founder.signature }}</strong>
        <p v-if="profile.founder.role" class="muted small">{{ profile.founder.role }}</p>
        <p class="muted small">{{ school.value.name }}</p>
      </div>
    </div>
  </section>
  <section class="section soft">
    <div class="container history-grid">
      <div>
        <h2>{{ profile.history.title }}</h2>
        <p v-for="text in profile.history.paragraphs" :key="text">{{ text }}</p>
      </div>
      <div
        v-if="profile.history.stats.length"
        class="history-stats"
        :class="{ compact: profile.history.stats.some((s) => s.value.length > 6) }"
      >
        <div v-for="stat in profile.history.stats" :key="stat.label">
          <strong>{{ stat.value }}</strong><span>{{ stat.label }}</span>
        </div>
      </div>
    </div>
  </section>
  <section class="section">
    <div class="container">
      <div class="section-heading">
        <h2>Nos valeurs</h2>
        <p>Les fondements de notre engagement éducatif</p>
      </div>
      <div class="values-grid">
        <article v-for="v in profile.values" :key="v.title">
          <span class="icon-tile"><Icon :name="v.icon" :size="28" /></span>
          <h3>{{ v.title }}</h3>
          <p>{{ v.text }}</p>
        </article>
      </div>
    </div>
  </section>
  <section id="contact" class="section soft">
    <div class="container">
      <div class="section-heading">
        <h2>Nous contacter</h2>
        <p>Notre équipe est à votre écoute</p>
      </div>
      <div class="contact-grid">
        <div class="contact-details">
          <div
            v-for="item in [
              { icon: 'pin', label: 'Adresse', value: school.value.address },
              { icon: 'phone', label: 'Téléphone', value: school.value.phone },
              { icon: 'mail', label: 'Email', value: school.value.email },
              { icon: 'clock', label: 'Horaires', value: school.value.hours },
            ].filter((item) => item.value)"
            :key="item.label"
          >
            <span class="icon-tile"><Icon :name="item.icon" /></span
            ><span
              ><strong>{{ item.label }}</strong>
              <p>{{ item.value }}</p></span
            >
          </div>
        </div>
        <form class="panel contact-form" @submit.prevent="contact">
          <h3>Envoyez-nous un message</h3>
          <div v-if="error" class="alert error" role="alert">{{ error }}</div>
          <div v-if="success" class="alert success" role="status">{{ success }}</div>
          <label
            >Votre nom<input v-model="form.parentName" required maxlength="160" autocomplete="name"
          /></label>
          <div class="form-grid">
            <label
              >Votre email<input
                v-model="form.email"
                type="email"
                required
                maxlength="254"
                autocomplete="email" /></label
            ><label
              >Votre téléphone <span class="muted small">(facultatif)</span
              ><input
                v-model="form.phone"
                type="tel"
                minlength="8"
                maxlength="40"
                pattern="[+()0-9 .\-]{8,40}"
                autocomplete="tel"
            /></label>
          </div>
          <label
            >Votre message<textarea
              v-model="form.message"
              required
              maxlength="4000"
              rows="4"
            ></textarea></label
          ><button class="btn" :disabled="busy">
            <Icon :name="busy ? 'loader' : 'mail'" :size="18" />{{
              busy ? 'Envoi en cours…' : 'Envoyer le message'
            }}
          </button>
        </form>
      </div>
    </div>
  </section>
  <section class="section">
    <div class="container narrow">
      <div class="section-heading">
        <h2>Questions fréquentes</h2>
        <p>Les réponses à vos questions</p>
      </div>
      <div class="faq-list">
        <article v-for="(faq, i) in profile.faq" :key="faq.q">
          <button
            :aria-expanded="openFaq === i"
            :aria-controls="'faq-' + i"
            @click="openFaq = openFaq === i ? null : i"
          >
            {{ faq.q }}<Icon name="chevron" :size="18" :class="{ rotated: openFaq === i }" />
          </button>
          <p v-if="openFaq === i" :id="'faq-' + i">
            {{ faq.a
            }}<RouterLink v-if="faq.link" :to="faq.link.to"> {{ faq.link.label }}</RouterLink>
          </p>
        </article>
      </div>
    </div>
  </section>
  <section class="cta-band">
    <div class="container">
      <Icon name="graduation" :size="44" />
      <h2>Préparons ensemble l’avenir de votre enfant</h2>
      <p>
        Découvrez notre établissement, échangez avec notre équipe et commencez dès maintenant les
        démarches d’admission.
      </p>
      <div class="hero-actions">
        <RouterLink class="btn white" to="/rendez-vous">Planifier une visite</RouterLink
        ><RouterLink class="btn outline-white" to="/preinscription">Se préinscrire</RouterLink>
      </div>
    </div>
  </section>
</template>
