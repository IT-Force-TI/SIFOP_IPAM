<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { errorMessage, services } from '../../services'
import type { ContentItem, ContentKind } from '../../models'
import { assetUrl, dateLabel } from '../../utils/format'
import Icon from '../../components/Icon.vue'
import Modal from '../../components/Modal.vue'
import EmptyState from '../../components/EmptyState.vue'
import ConfirmDialog from '../../components/ConfirmDialog.vue'
const props = defineProps<{ kind: ContentKind }>()
const info = computed(
  () =>
    ({
      actualites: {
        title: 'Actualités',
        description: 'Gérez les actualités publiées sur le site de l’établissement.',
        create: 'Créer une actualité',
        empty: 'Aucune actualité',
        icon: 'news',
      },
      evenements: {
        title: 'Événements',
        description: 'Partagez les prochains rendez-vous de la vie scolaire.',
        create: 'Créer un événement',
        empty: 'Aucun événement',
        icon: 'calendar',
      },
      galerie: {
        title: 'Galerie',
        description: 'Gérez les photos de l’établissement.',
        create: 'Ajouter une photo',
        empty: 'Aucune photo',
        icon: 'images',
      },
    })[props.kind]!,
)
const items = ref<ContentItem[]>([]),
  search = ref(''),
  publication = ref(''),
  category = ref(''),
  loading = ref(true),
  busy = ref(false),
  uploading = ref(false),
  error = ref(''),
  modalError = ref(''),
  success = ref(''),
  editing = ref(false),
  deleting = ref<ContentItem | null>(null)
type Draft = Omit<ContentItem, 'kind' | 'createdAt' | 'id'> & { id?: number }
const blank = (): Draft => ({
  title: '',
  summary: '',
  body: '',
  category: 'Vie scolaire',
  eventDate: '',
  location: '',
  imageUrl: '',
  album: '',
  cycle: '',
  published: false,
})
const form = ref<Draft>(blank())
const filtered = computed(() =>
  items.value.filter(
    (x) =>
      x.title.toLowerCase().includes(search.value.toLowerCase()) &&
      (!publication.value || x.published === (publication.value === 'published')) &&
      (!category.value || x.category === category.value),
  ),
)
const categories = computed(() => [...new Set(items.value.map((x) => x.category).filter(Boolean))])
const albums = computed(() => [...new Set(items.value.map((x) => x.album).filter(Boolean))])
const page = ref(1),
  pageCount = computed(() => Math.max(1, Math.ceil(filtered.value.length / 10)))
const visible = computed(() =>
  filtered.value.slice(
    (Math.min(page.value, pageCount.value) - 1) * 10,
    Math.min(page.value, pageCount.value) * 10,
  ),
)
async function load() {
  loading.value = true
  error.value = ''
  try {
    items.value = await services.content.list(props.kind)
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    loading.value = false
  }
}
function open(item?: ContentItem) {
  form.value = item
    ? {
        id: item.id,
        title: item.title,
        summary: item.summary || '',
        body: item.body || '',
        category: item.category || '',
        eventDate: item.eventDate || '',
        location: item.location || '',
        imageUrl: item.imageUrl || '',
        album: item.album || '',
        cycle: item.cycle || '',
        published: item.published,
      }
    : blank()
  modalError.value = ''
  success.value = ''
  editing.value = true
}
async function upload(event: Event) {
  const input = event.target as HTMLInputElement,
    file = input.files?.[0]
  if (!file) return
  if (!['image/jpeg', 'image/png'].includes(file.type) || file.size > 5 * 1024 * 1024) {
    modalError.value = 'Choisissez une image JPEG ou PNG de moins de 5 Mo.'
    input.value = ''
    return
  }
  uploading.value = true
  modalError.value = ''
  try {
    form.value.imageUrl = await services.content.uploadImage(file)
  } catch (e) {
    modalError.value = errorMessage(e)
  } finally {
    uploading.value = false
    input.value = ''
  }
}
async function save() {
  if (uploading.value) return
  busy.value = true
  modalError.value = ''
  try {
    const { id, ...values } = form.value
    const payload = { ...values, eventDate: props.kind === 'evenements' ? values.eventDate : null }
    const result = id
      ? await services.content.update(props.kind, id, payload)
      : await services.content.create(props.kind, payload)
    items.value = id ? items.value.map((x) => (x.id === id ? result : x)) : [result, ...items.value]
    editing.value = false
    success.value = 'Contenu enregistré.'
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
    await services.content.remove(props.kind, deleting.value.id)
    items.value = items.value.filter((x) => x.id !== deleting.value!.id)
    deleting.value = null
    success.value = 'Contenu supprimé.'
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
      <span class="eyebrow">GESTION DU SITE</span>
      <h1>{{ info.title }}</h1>
      <p>{{ info.description }}</p>
    </div>
    <button class="btn" @click="open()"><Icon name="plus" :size="18" />{{ info.create }}</button>
  </div>
  <div v-if="success" class="alert success" role="status">{{ success }}</div>
  <div v-if="error" class="alert error" role="alert">
    {{ error }} <button class="text-button" @click="load">Réessayer</button>
  </div>
  <section class="panel">
    <div class="table-toolbar">
      <label class="search-input"
        ><span class="sr-only">Rechercher</span><Icon name="search" :size="18" /><input
          v-model="search"
          placeholder="Rechercher un contenu…"
          @input="page = 1" /></label
      ><label
        ><span class="sr-only">Filtrer par publication</span
        ><select v-model="publication" @change="page = 1">
          <option value="">Tous les statuts</option>
          <option value="published">Publié</option>
          <option value="draft">Brouillon</option>
        </select></label
      ><label v-if="kind === 'actualites'"
        ><span class="sr-only">Filtrer par catégorie</span
        ><select v-model="category" @change="page = 1">
          <option value="">Toutes les catégories</option>
          <option v-for="cat in categories" :key="cat">{{ cat }}</option>
        </select></label
      >
    </div>
    <p v-if="loading" class="loading"><Icon name="loader" />Chargement…</p>
    <EmptyState
      v-else-if="!filtered.length"
      :title="search || publication || category ? 'Aucun résultat' : info.empty"
      :description="
        items.length
          ? 'Modifiez les filtres pour retrouver vos contenus.'
          : 'Commencez par créer votre premier contenu.'
      "
      :icon="info.icon"
      ><button class="btn small" @click="open()">
        <Icon name="plus" :size="16" />{{ info.create }}
      </button></EmptyState
    ><template v-else
      ><div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Contenu</th>
              <th v-if="kind === 'actualites'">Catégorie</th>
              <th v-if="kind === 'evenements'">Date / Lieu</th>
              <th v-if="kind === 'galerie'">Album / Cycle</th>
              <th>Publication</th>
              <th>Créé le</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in visible" :key="item.id">
              <td>
                <div class="content-cell">
                  <img v-if="item.imageUrl" :src="assetUrl(item.imageUrl)" :alt="item.title" />
                  <div>
                    <strong>{{ item.title }}</strong
                    ><small class="truncate">{{ item.summary }}</small>
                  </div>
                </div>
              </td>
              <td v-if="kind === 'actualites'">
                <span class="pill">{{ item.category || 'Sans catégorie' }}</span>
              </td>
              <td v-if="kind === 'evenements'">
                {{ dateLabel(item.eventDate) }}<small>{{ item.location }}</small>
              </td>
              <td v-if="kind === 'galerie'">
                {{ item.album || 'Sans album' }}<small>{{ item.cycle }}</small>
              </td>
              <td>
                <span class="status-pill" :class="item.published ? 'accepted' : 'pending'">{{
                  item.published ? 'Publié' : 'Brouillon'
                }}</span>
              </td>
              <td>{{ dateLabel(item.createdAt) }}</td>
              <td>
                <div class="row-actions">
                  <button class="btn small light" @click="open(item)">
                    <Icon name="edit" :size="16" />Modifier</button
                  ><button
                    class="icon-button destructive"
                    :aria-label="'Supprimer ' + item.title"
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
        <span>{{ filtered.length }} contenu(s)</span>
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
    v-if="editing"
    :title="form.id ? 'Modifier le contenu' : info.create"
    wide
    @close="!busy && !uploading && (editing = false)"
    ><form @submit.prevent="save">
      <div v-if="modalError" class="alert error" role="alert">{{ modalError }}</div>
      <label
        >Titre <span class="required">*</span
        ><input v-model="form.title" required maxlength="200" /></label
      ><label>Résumé<textarea v-model="form.summary" maxlength="500" rows="2"></textarea></label>
      <div class="form-grid">
        <label v-if="kind === 'actualites'"
          >Catégorie<input v-model="form.category" maxlength="80" list="categories" /><datalist
            id="categories"
          >
            <option>Vie scolaire</option>
            <option>Pédagogie</option>
            <option>Informations</option>
            <option>Événements</option>
          </datalist></label
        ><template v-if="kind === 'evenements'"
          ><label
            >Date de l’événement <span class="required">*</span
            ><input v-model="form.eventDate" type="date" required /></label
          ><label>Lieu<input v-model="form.location" maxlength="200" /></label
          ><label
            >Type d’événement<input v-model="form.category" maxlength="80" placeholder="Sport, Culture…"
          /></label>
        </template>
        <template v-if="kind === 'galerie'"
          ><label
            >Album / classe <span class="required">*</span
            ><input
              v-model="form.album"
              required
              maxlength="120"
              list="albums"
              placeholder="Classe de CP1" /><datalist id="albums">
              <option v-for="a in albums" :key="a">{{ a }}</option>
            </datalist></label
          ><label
            >Cycle<select v-model="form.cycle">
              <option value="">—</option>
              <option>Maternelle</option>
              <option>Primaire</option>
              <option>Collège</option>
            </select></label
          ></template
        >
      </div>
      <label v-if="kind !== 'galerie'"
        >Contenu<textarea
          v-model="form.body"
          maxlength="30000"
          rows="6"
          placeholder="Rédigez le contenu de votre publication…"
        ></textarea>
      </label>
      <div class="image-upload">
        <label
          >Image {{ kind === 'galerie' ? '*' : '(facultative)'
          }}<input
            type="file"
            accept="image/jpeg,image/png"
            :disabled="uploading || busy"
            @change="upload"
        /></label>
        <p class="small muted">JPEG ou PNG, 5 Mo maximum.</p>
        <p v-if="uploading" class="loading"><Icon name="loader" />Téléversement…</p>
        <div v-if="form.imageUrl" class="upload-preview">
          <img :src="assetUrl(form.imageUrl)" alt="Aperçu de l’image" /><button
            type="button"
            class="btn small light"
            @click="form.imageUrl = ''"
          >
            Retirer l’image
          </button>
        </div>
      </div>
      <label class="checkbox-label"
        ><input v-model="form.published" type="checkbox" /><span>Publié sur le site</span></label
      >
      <p class="muted small">Un brouillon reste visible uniquement dans l’administration.</p>
      <div class="form-actions">
        <button
          type="button"
          class="btn light"
          :disabled="busy || uploading"
          @click="editing = false"
        >
          Annuler</button
        ><button
          class="btn"
          :disabled="busy || uploading || (kind === 'galerie' && !form.imageUrl)"
        >
          <Icon :name="busy ? 'loader' : 'save'" :size="17" />{{
            busy ? 'Enregistrement…' : 'Enregistrer'
          }}
        </button>
      </div>
    </form></Modal
  ><ConfirmDialog
    v-if="deleting"
    :message="'Supprimer « ' + deleting.title + ' » ?'"
    :busy="busy"
    @close="!busy && (deleting = null)"
    @confirm="remove"
  />
</template>
