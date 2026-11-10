<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { errorMessage, services } from '../../services'
import type { RequestKind, SchoolRequest } from '../../models'
import { dateLabel, statusLabels } from '../../utils/format'
import Icon from '../../components/Icon.vue'
import Modal from '../../components/Modal.vue'
import EmptyState from '../../components/EmptyState.vue'
import ConfirmDialog from '../../components/ConfirmDialog.vue'
const props = defineProps<{ kind: RequestKind }>()
const info = computed(
  () =>
    ({
      preinscriptions: {
        title: 'Préinscriptions',
        subtitle: 'Consultez et traitez les demandes d’inscription.',
        icon: 'file',
        empty: 'Aucune préinscription',
        statuses: ['PENDING', 'ACCEPTED', 'REJECTED'],
      },
      visites: {
        title: 'Demandes de visite',
        subtitle: 'Organisez les rendez-vous avec les familles.',
        icon: 'calendar',
        empty: 'Aucune demande de visite',
        statuses: ['PENDING', 'CONFIRMED', 'CANCELLED'],
      },
      messages: {
        title: 'Messages',
        subtitle: 'Retrouvez les messages envoyés depuis le site.',
        icon: 'message',
        empty: 'Aucun message',
        statuses: ['UNREAD', 'READ'],
      },
    })[props.kind]!,
)
const items = ref<SchoolRequest[]>([]),
  search = ref(''),
  status = ref(''),
  selected = ref<SchoolRequest | null>(null),
  nextStatus = ref(''),
  deleting = ref<SchoolRequest | null>(null),
  busy = ref(false),
  loading = ref(true),
  error = ref(''),
  modalError = ref(''),
  success = ref('')
const filtered = computed(() =>
  items.value.filter(
    (x) =>
      (!status.value || x.status === status.value) &&
      [x.firstName, x.lastName, x.parentName, x.email, x.reference]
        .join(' ')
        .toLowerCase()
        .includes(search.value.toLowerCase()),
  ),
)
const page = ref(1),
  pageSize = 10
const pageCount = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))
const visible = computed(() =>
  filtered.value.slice(
    (Math.min(page.value, pageCount.value) - 1) * pageSize,
    Math.min(page.value, pageCount.value) * pageSize,
  ),
)
async function load() {
  loading.value = true
  error.value = ''
  try {
    items.value = await services.requests.list(props.kind)
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    loading.value = false
  }
}
function open(item: SchoolRequest) {
  selected.value = item
  nextStatus.value = item.status
  modalError.value = ''
  success.value = ''
}
async function saveStatus() {
  if (!selected.value) return
  busy.value = true
  modalError.value = ''
  try {
    const updated = await services.requests.updateStatus(
      props.kind,
      selected.value.id,
      nextStatus.value,
    )
    items.value = items.value.map((x) => (x.id === updated.id ? updated : x))
    selected.value = null
    success.value = 'Statut enregistré.'
  } catch (e) {
    modalError.value = errorMessage(e)
  } finally {
    busy.value = false
  }
}
async function remove() {
  if (!deleting.value) return
  busy.value = true
  try {
    await services.requests.remove(props.kind, deleting.value.id)
    items.value = items.value.filter((x) => x.id !== deleting.value!.id)
    deleting.value = null
    selected.value = null
    success.value = 'Demande supprimée.'
  } catch (e) {
    error.value = errorMessage(e)
    deleting.value = null
  } finally {
    busy.value = false
  }
}
onMounted(load)
</script>
<template>
  <div class="page-heading">
    <div>
      <span class="eyebrow">GESTION</span>
      <h1>{{ info.title }}</h1>
      <p>{{ info.subtitle }}</p>
    </div>
    <span class="count-pill">{{ items.length }} demande(s)</span>
  </div>
  <div v-if="success" role="status" class="alert success">{{ success }}</div>
  <div v-if="error" role="alert" class="alert error">
    {{ error }} <button class="text-button" @click="load">Réessayer</button>
  </div>
  <section class="panel">
    <div class="table-toolbar">
      <label class="search-input"
        ><span class="sr-only">Rechercher</span><Icon name="search" :size="18" /><input
          v-model="search"
          placeholder="Rechercher un nom, un email, une référence…"
          @input="page = 1" /></label
      ><label
        ><span class="sr-only">Filtrer par statut</span
        ><select v-model="status" @change="page = 1">
          <option value="">Tous les statuts</option>
          <option v-for="s in info.statuses" :key="s" :value="s">{{ statusLabels[s] }}</option>
        </select></label
      >
    </div>
    <p v-if="loading" class="loading"><Icon name="loader" />Chargement…</p>
    <EmptyState
      v-else-if="!filtered.length"
      :title="search || status ? 'Aucun résultat' : info.empty"
      :description="
        search || status
          ? 'Essayez un autre filtre ou une autre recherche.'
          : 'Les nouvelles demandes apparaîtront ici.'
      "
      :icon="info.icon"
    /><template v-else
      ><div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>{{ kind === 'preinscriptions' ? 'Élève' : 'Nom' }}</th>
              <th>Contact</th>
              <th>
                {{
                  kind === 'preinscriptions'
                    ? 'Cycle / Classe'
                    : kind === 'visites'
                      ? 'Visite souhaitée'
                      : 'Message'
                }}
              </th>
              <th>Statut</th>
              <th>Reçue le</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in visible" :key="item.id">
              <td>
                <strong>{{
                  kind === 'preinscriptions'
                    ? item.firstName + ' ' + item.lastName
                    : item.parentName
                }}</strong
                ><small>{{ item.reference }}</small>
              </td>
              <td>
                {{ item.email }}<small>{{ item.phone }}</small>
              </td>
              <td>
                <template v-if="kind === 'preinscriptions'"
                  >{{ item.cycle }}<small>{{ item.className }}</small></template
                ><template v-else-if="kind === 'visites'"
                  >{{ dateLabel(item.visitDate) }}<small>{{ item.slot }}</small></template
                ><span v-else class="truncate">{{ item.message }}</span>
              </td>
              <td>
                <span class="status-pill" :class="item.status.toLowerCase()">{{
                  statusLabels[item.status]
                }}</span>
              </td>
              <td>{{ dateLabel(item.createdAt) }}</td>
              <td>
                <div class="row-actions">
                  <button class="btn small light" @click="open(item)">
                    <Icon name="eye" :size="16" />Consulter</button
                  ><button
                    class="icon-button destructive"
                    :aria-label="'Supprimer ' + item.reference"
                    @click="deleting = item"
                  >
                    <Icon name="trash" :size="17" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pagination">
        <span>{{ filtered.length }} résultat(s)</span>
        <div>
          <button class="btn small light" :disabled="page <= 1" @click="page--">Précédent</button
          ><span>{{ Math.min(page, pageCount) }} / {{ pageCount }}</span
          ><button class="btn small light" :disabled="page >= pageCount" @click="page++">
            Suivant
          </button>
        </div>
      </div></template
    >
  </section>
  <Modal
    v-if="selected"
    :title="'Demande ' + selected.reference"
    wide
    @close="!busy && (selected = null)"
    ><div v-if="modalError" class="alert error" role="alert">{{ modalError }}</div>
    <dl class="detail-grid">
      <template v-if="kind === 'preinscriptions'"
        ><div>
          <dt>Élève</dt>
          <dd>{{ selected.firstName }} {{ selected.lastName }}</dd>
        </div>
        <div>
          <dt>Date de naissance</dt>
          <dd>{{ dateLabel(selected.birthDate) }}</dd>
        </div>
        <div>
          <dt>Cycle / Classe</dt>
          <dd>{{ selected.cycle }} — {{ selected.className }}</dd>
        </div></template
      >
      <div>
        <dt>Responsable</dt>
        <dd>{{ selected.parentName }}</dd>
      </div>
      <div>
        <dt>Email</dt>
        <dd>
          <a :href="'mailto:' + selected.email">{{ selected.email }}</a>
        </dd>
      </div>
      <div>
        <dt>Téléphone</dt>
        <dd>
          <a :href="'tel:' + selected.phone">{{ selected.phone }}</a>
        </dd>
      </div>
      <div v-if="kind === 'visites'">
        <dt>Visite souhaitée</dt>
        <dd>{{ dateLabel(selected.visitDate) }} à {{ selected.slot }}</dd>
      </div>
      <div>
        <dt>Demande reçue le</dt>
        <dd>{{ dateLabel(selected.createdAt) }}</dd>
      </div>
      <div class="full">
        <dt>Message</dt>
        <dd class="prose">{{ selected.message || 'Aucun message complémentaire.' }}</dd>
      </div>
    </dl>
    <form class="status-form" @submit.prevent="saveStatus">
      <label
        >Statut<select v-model="nextStatus">
          <option v-for="s in info.statuses" :key="s" :value="s">{{ statusLabels[s] }}</option>
        </select></label
      ><button class="btn" :disabled="busy">
        <Icon :name="busy ? 'loader' : 'save'" :size="17" />Enregistrer le statut
      </button>
    </form></Modal
  ><ConfirmDialog
    v-if="deleting"
    :message="'Supprimer la demande ' + deleting.reference + ' ?'"
    :busy="busy"
    @close="!busy && (deleting = null)"
    @confirm="remove"
  />
</template>
