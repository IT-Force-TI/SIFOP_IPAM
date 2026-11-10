<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { classesByCycle as classes } from '../config/school'
import { VISIT_SLOTS, type RequestInput } from '../models'
import { ApiError, errorMessage, services } from '../services'
import { todayIso } from '../utils/format'
import Icon from './Icon.vue'
const props = defineProps<{ kind: 'preinscriptions' | 'visites' }>()
const route = useRoute()
const isRegistration = computed(() => props.kind === 'preinscriptions')
const suggested = String(route.query.cycle || '')
const form = reactive({
  firstName: '',
  lastName: '',
  birthDate: '',
  cycle: classes[suggested] ? suggested : '',
  className: '',
  parentName: '',
  email: '',
  phone: '',
  date: '',
  slot: '',
  message: '',
})
const consent = ref(false),
  busy = ref(false),
  error = ref(''),
  fields = ref<Record<string, string>>({}),
  reference = ref('')
const today = todayIso()
const maxDate = new Date()
maxDate.setFullYear(maxDate.getFullYear() + 1)
watch(
  () => form.cycle,
  () => {
    form.className = ''
  },
)
async function submit() {
  error.value = ''
  fields.value = {}
  if (!consent.value) {
    error.value = 'Veuillez confirmer l’exactitude des informations.'
    return
  }
  busy.value = true
  const payload: RequestInput = {
    parentName: form.parentName,
    email: form.email,
    phone: form.phone,
    message: form.message,
  }
  if (isRegistration.value)
    Object.assign(payload, {
      firstName: form.firstName,
      lastName: form.lastName,
      birthDate: form.birthDate,
      cycle: form.cycle,
      className: form.className,
    })
  else Object.assign(payload, { date: form.date, slot: form.slot })
  try {
    const result = await services.requests.submit(props.kind, payload)
    reference.value = result.reference
  } catch (e) {
    error.value = errorMessage(e)
    if (e instanceof ApiError) fields.value = e.errors
  } finally {
    busy.value = false
  }
}
</script>
<template>
  <section v-if="reference" class="panel request-success" aria-live="polite">
    <span class="success-mark"><Icon name="success" :size="42" /></span>
    <h2>Votre demande a bien été reçue</h2>
    <p>
      {{
        isRegistration
          ? 'Notre équipe étudiera votre préinscription et vous contactera pour la suite des démarches.'
          : 'Notre équipe vous contactera pour confirmer la date et le créneau de votre visite.'
      }}
    </p>
    <p class="muted">Conservez votre référence :</p>
    <strong class="reference-code" data-testid="reference">{{ reference }}</strong>
    <p class="small muted">
      Une demande de visite ou une préinscription ne constitue pas une confirmation définitive.
    </p>
    <RouterLink to="/" class="btn">Retour à l’accueil</RouterLink>
  </section>
  <form v-else class="request-form" @submit.prevent="submit">
    <div v-if="error" class="alert error" role="alert">
      {{ error }}
      <ul v-if="Object.keys(fields).length">
        <li v-for="(message, field) in fields" :key="field">{{ message }}</li>
      </ul>
    </div>
    <section v-if="isRegistration" class="panel form-section">
      <h2>
        <span class="icon-tile"><Icon name="graduation" /></span>Informations sur l’élève
      </h2>
      <p>Renseignez les informations concernant l’enfant.</p>
      <div class="form-grid">
        <label
          >Prénom de l’élève <span class="required">*</span
          ><input
            v-model="form.firstName"
            placeholder="Ex. : Amina"
            required
            maxlength="100"
            autocomplete="given-name" /></label
        ><label
          >Nom de l’élève <span class="required">*</span
          ><input
            v-model="form.lastName"
            placeholder="Ex. : Mensah"
            required
            maxlength="100"
            autocomplete="family-name" /></label
        ><label
          >Date de naissance <span class="required">*</span
          ><input
            v-model="form.birthDate"
            type="date"
            required
            :max="today"
            min="2001-01-01" /></label
        ><label
          >Cycle demandé <span class="required">*</span
          ><select v-model="form.cycle" required>
            <option value="" disabled>Sélectionnez un cycle</option>
            <option v-for="(_, name) in classes" :key="name" :value="name">{{ name }}</option>
          </select></label
        ><label
          >Classe souhaitée <span class="required">*</span
          ><select v-model="form.className" required :disabled="!form.cycle">
            <option value="" disabled>Sélectionnez une classe</option>
            <option v-for="name in classes[form.cycle] || []" :key="name">{{ name }}</option>
          </select></label
        >
      </div>
    </section>
    <section class="panel form-section">
      <h2>
        <span class="icon-tile"><Icon name="user" /></span
        >{{ isRegistration ? 'Informations du responsable' : 'Vos coordonnées' }}
      </h2>
      <p>Ces informations nous permettront de vous recontacter.</p>
      <div class="form-grid">
        <label class="full"
          >Nom du responsable <span class="required">*</span
          ><input
            v-model="form.parentName"
            placeholder="Votre nom complet"
            required
            maxlength="160"
            autocomplete="name" /></label
        ><label
          >Adresse email <span class="required">*</span
          ><input
            v-model="form.email"
            type="email"
            placeholder="vous@exemple.com"
            required
            maxlength="254"
            autocomplete="email" /></label
        ><label
          >Téléphone <span class="required">*</span
          ><input
            v-model="form.phone"
            type="tel"
            placeholder="+228 …"
            required
            minlength="8"
            maxlength="40"
            pattern="[+()0-9 .\-]{8,40}"
            autocomplete="tel"
        /></label>
      </div>
    </section>
    <section v-if="!isRegistration" class="panel form-section">
      <h2>
        <span class="icon-tile"><Icon name="calendar" /></span>Votre disponibilité
      </h2>
      <p>Choisissez une date et un créneau pour votre visite.</p>
      <div class="form-grid">
        <label
          >Date souhaitée <span class="required">*</span
          ><input
            v-model="form.date"
            type="date"
            :min="today"
            :max="maxDate.toLocaleDateString('en-CA')"
            required /></label
        ><label
          >Créneau souhaité <span class="required">*</span
          ><select v-model="form.slot" required>
            <option value="" disabled>Sélectionnez un créneau</option>
            <option
              v-for="slot in VISIT_SLOTS"
              :key="slot"
              :value="slot"
            >
              {{ slot.replace(':', 'h') }}
            </option>
          </select></label
        >
      </div>
      <div class="info-note">
        <Icon name="shield" :size="18" />
        <p>
          Le créneau choisi constitue une préférence. L’établissement pourra vous proposer ou
          confirmer un créneau après réception de la demande.
        </p>
      </div>
    </section>
    <section class="panel form-section">
      <h2>
        <span class="icon-tile"><Icon name="message" /></span>Informations complémentaires
      </h2>
      <p>
        Ajoutez toute précision qui pourrait nous aider à préparer
        {{ isRegistration ? 'votre dossier' : 'votre visite' }}.
      </p>
      <label
        >Message <span class="muted small">(facultatif)</span
        ><textarea
          v-model="form.message"
          maxlength="4000"
          rows="4"
          placeholder="Une question particulière ou une information que vous souhaitez nous communiquer…"
        ></textarea>
      </label>
    </section>
    <div class="panel form-section">
      <label class="checkbox-label"
        ><input v-model="consent" type="checkbox" required /><span
          >Je confirme l’exactitude des informations et j’accepte d’être contacté par
          l’établissement pour le traitement de cette demande.</span
        ></label
      >
      <p class="small muted">
        Vos coordonnées sont utilisées uniquement pour traiter cette demande.
      </p>
      <div class="form-actions">
        <span class="small muted">Les champs marqués * sont obligatoires.</span
        ><button class="btn" :disabled="busy">
          <Icon :name="busy ? 'loader' : isRegistration ? 'register' : 'calendar'" :size="18" />{{
            busy
              ? 'Envoi en cours…'
              : isRegistration
                ? 'Envoyer la préinscription'
                : 'Demander un rendez-vous'
          }}
        </button>
      </div>
    </div>
  </form>
</template>
