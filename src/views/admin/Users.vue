<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { errorMessage, services } from '../../services'
import type { AdminUser } from '../../models'
import { auth } from '../../stores/auth'
import Icon from '../../components/Icon.vue'
import Modal from '../../components/Modal.vue'
import EmptyState from '../../components/EmptyState.vue'
const items = ref<AdminUser[]>([]),
  search = ref(''),
  loading = ref(true),
  editing = ref(false),
  busy = ref(false),
  error = ref(''),
  modalError = ref(''),
  success = ref('')
type Draft = Omit<AdminUser, 'id'> & { id?: number; password: string }
const blank = (): Draft => ({ name: '', email: '', role: 'ADMIN', active: true, password: '' })
const form = ref<Draft>(blank())
const filtered = computed(() =>
  items.value.filter((x) =>
    (x.name + ' ' + x.email).toLowerCase().includes(search.value.toLowerCase()),
  ),
)
async function load() {
  loading.value = true
  error.value = ''
  try {
    items.value = await services.users.list()
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    loading.value = false
  }
}
function open(item?: AdminUser) {
  form.value = item ? { ...item, password: '' } : blank()
  modalError.value = ''
  success.value = ''
  editing.value = true
}
async function save() {
  busy.value = true
  modalError.value = ''
  try {
    const { id, ...data } = form.value
    const result = id ? await services.users.update(id, data) : await services.users.create(data)
    items.value = id ? items.value.map((x) => (x.id === id ? result : x)) : [...items.value, result]
    if (auth.user?.id === result.id) auth.user = result
    editing.value = false
    success.value = 'Utilisateur enregistré.'
  } catch (e) {
    modalError.value = errorMessage(e)
  } finally {
    busy.value = false
  }
}
onMounted(load)
</script>
<template>
  <div class="page-heading">
    <div>
      <span class="eyebrow">ADMINISTRATION</span>
      <h1>Utilisateurs</h1>
      <p>Gérez les accès des administrateurs de l’établissement.</p>
    </div>
    <button class="btn" @click="open()">
      <Icon name="plus" :size="18" />Ajouter un utilisateur
    </button>
  </div>
  <div v-if="error" class="alert error" role="alert">
    {{ error }} <button class="text-button" @click="load">Réessayer</button>
  </div>
  <div v-if="success" class="alert success" role="status">{{ success }}</div>
  <section class="panel">
    <div class="table-toolbar">
      <label class="search-input"
        ><span class="sr-only">Rechercher</span><Icon name="search" :size="18" /><input
          v-model="search"
          placeholder="Rechercher un utilisateur…"
      /></label>
    </div>
    <p v-if="loading" class="loading"><Icon name="loader" />Chargement…</p>
    <EmptyState v-else-if="!filtered.length" title="Aucun utilisateur trouvé" icon="users" />
    <div v-else class="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Utilisateur</th>
            <th>Email</th>
            <th>Rôle</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filtered" :key="item.id">
            <td>
              <strong>{{ item.name }}</strong
              ><small v-if="auth.user?.id === item.id">Votre compte</small>
            </td>
            <td>{{ item.email }}</td>
            <td>{{ item.role === 'SUPER_ADMIN' ? 'Super administrateur' : 'Administrateur' }}</td>
            <td>
              <span class="status-pill" :class="item.active ? 'accepted' : 'cancelled'">{{
                item.active ? 'Actif' : 'Désactivé'
              }}</span>
            </td>
            <td>
              <button class="btn small light" @click="open(item)">
                <Icon name="edit" :size="16" />Modifier
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
  <Modal
    v-if="editing"
    :title="form.id ? 'Modifier l’utilisateur' : 'Ajouter un utilisateur'"
    @close="!busy && (editing = false)"
    ><form @submit.prevent="save">
      <div v-if="modalError" class="alert error" role="alert">{{ modalError }}</div>
      <label
        >Nom complet <span class="required">*</span
        ><input v-model="form.name" required maxlength="120" /></label
      ><label
        >Adresse email <span class="required">*</span
        ><input v-model="form.email" type="email" required maxlength="254" /></label
      ><label
        >Rôle<select v-model="form.role">
          <option value="ADMIN">Administrateur</option>
          <option value="SUPER_ADMIN">Super administrateur</option>
        </select></label
      ><label
        >{{ form.id ? 'Nouveau mot de passe' : 'Mot de passe'
        }}<input
          v-model="form.password"
          type="password"
          :required="!form.id"
          minlength="12"
          maxlength="72"
          autocomplete="new-password"
      /></label>
      <p class="small muted">
        12 caractères minimum.
        {{ form.id ? 'Laissez vide pour conserver le mot de passe actuel.' : '' }}
      </p>
      <label class="checkbox-label"
        ><input v-model="form.active" type="checkbox" /><span>Compte actif</span></label
      >
      <div class="form-actions">
        <button class="btn light" type="button" :disabled="busy" @click="editing = false">
          Annuler</button
        ><button class="btn" :disabled="busy">
          <Icon :name="busy ? 'loader' : 'save'" :size="17" />{{
            busy ? 'Enregistrement…' : 'Enregistrer'
          }}
        </button>
      </div>
    </form></Modal
  >
</template>
