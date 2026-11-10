// Implémentation des services avec les FAKE DATA (VITE_DATA_SOURCE=mock, par défaut).
// Chaque méthode reproduit le comportement de la route backend correspondante
// (backend/src/routes) : mêmes filtres, mêmes tris, mêmes erreurs, mêmes formes de réponse.
import type { DataServices } from '../contracts'
import {
  REQUEST_STATUSES,
  type AdminUser,
  type ContentItem,
  type ContentKind,
  type SchoolRequest,
} from '../../models'
import { apiError } from '../errors'
import { clone, commit, db, latency, nextId } from '../../mocks/db'
import type { MockUser } from '../../mocks/data'
import { validateContent, validateRequest, validateSettings, validateUser } from '../../mocks/validation'

const notFound = (message = 'Ressource introuvable.') => apiError(404, message)

const publicUser = ({ id, name, email, role, active }: MockUser): AdminUser => ({
  id,
  name,
  email,
  role,
  active,
})

/** Équivalent du middleware requireAuth. */
function currentUser(): MockUser {
  const { sessionUserId, users } = db()
  if (sessionUserId === null) throw apiError(401, 'Connexion requise.')
  const user = users.find((u) => u.id === sessionUserId)
  if (!user || !user.active) {
    db().sessionUserId = null
    commit()
    throw apiError(401, 'Compte indisponible.')
  }
  return user
}

function requireSuperAdmin() {
  if (currentUser().role !== 'SUPER_ADMIN')
    throw apiError(403, 'Action réservée au super administrateur.')
}

const byNewest = <T extends { createdAt: string; id: number }>(a: T, b: T) =>
  b.createdAt.localeCompare(a.createdAt) || b.id - a.id

function contentValues(kind: ContentKind, values: Parameters<typeof validateContent>[1]) {
  validateContent(kind, values)
  const t = (v: unknown) => (typeof v === 'string' ? v.trim() : '')
  return {
    title: t(values.title),
    summary: t(values.summary),
    body: t(values.body),
    category: t(values.category),
    imageUrl: t(values.imageUrl),
    published: Boolean(values.published),
    // Champs propres à un type de contenu : vidés pour les autres (comme le backend).
    eventDate: kind === 'evenements' ? t(values.eventDate) : '',
    location: kind === 'evenements' ? t(values.location) : '',
    album: kind === 'galerie' ? t(values.album) : '',
    cycle: kind === 'galerie' ? t(values.cycle) : '',
  }
}

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const PREFIX = { preinscriptions: 'PRE', visites: 'VIS', messages: 'MSG' } as const
const INITIAL_STATUS = { preinscriptions: 'PENDING', visites: 'PENDING', messages: 'UNREAD' } as const

function reference(kind: keyof typeof PREFIX) {
  const bytes = crypto.getRandomValues(new Uint8Array(6))
  const code = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('')
  return `${PREFIX[kind]}-${new Date().getFullYear()}-${code}`
}

function activeSuperAdmins(excludeId: number) {
  return db().users.filter((u) => u.role === 'SUPER_ADMIN' && u.active && u.id !== excludeId).length
}

function readImage(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(apiError(400, 'Téléversement invalide.'))
    reader.readAsDataURL(file)
  })
}

export const mockServices: DataServices = {
  auth: {
    async login(email, password) {
      await latency()
      const user = db().users.find((u) => u.email === email.trim().toLowerCase())
      if (!user || user.password !== password || !user.active)
        throw apiError(401, 'Adresse email ou mot de passe incorrect.')
      db().sessionUserId = user.id
      commit()
      return publicUser(user)
    },
    async logout() {
      await latency()
      db().sessionUserId = null
      commit()
    },
    async me() {
      const { sessionUserId, users } = db()
      const user = users.find((u) => u.id === sessionUserId)
      return user && user.active ? publicUser(user) : null
    },
  },

  settings: {
    async getPublic() {
      await latency()
      return clone(db().settings)
    },
    async get() {
      await latency()
      currentUser()
      return clone(db().settings)
    },
    async update(values) {
      await latency()
      currentUser()
      validateSettings(values)
      db().settings = { ...clone(values), phone2: values.phone2 || '' }
      commit()
      return clone(db().settings)
    },
  },

  content: {
    async listPublished(kind) {
      await latency()
      const items = db().contents.filter((c) => c.kind === kind && c.published)
      items.sort(
        kind === 'evenements'
          ? (a, b) => b.eventDate.localeCompare(a.eventDate) || b.id - a.id
          : byNewest,
      )
      return clone(items)
    },
    async getPublished(kind, id) {
      await latency()
      const item = db().contents.find((c) => c.kind === kind && c.id === id && c.published)
      if (!item) throw notFound('Contenu introuvable.')
      return clone(item)
    },
    async list(kind) {
      await latency()
      currentUser()
      return clone(db().contents.filter((c) => c.kind === kind).sort(byNewest))
    },
    async create(kind, values) {
      await latency()
      currentUser()
      const item: ContentItem = {
        ...contentValues(kind, values),
        id: nextId(db().contents),
        kind,
        createdAt: new Date().toISOString(),
      }
      db().contents.push(item)
      commit()
      return clone(item)
    },
    async update(kind, id, values) {
      await latency()
      currentUser()
      const item = db().contents.find((c) => c.kind === kind && c.id === id)
      if (!item) throw notFound('Contenu introuvable.')
      Object.assign(item, contentValues(kind, values))
      commit()
      return clone(item)
    },
    async remove(kind, id) {
      await latency()
      currentUser()
      const list = db().contents
      const index = list.findIndex((c) => c.kind === kind && c.id === id)
      if (index < 0) throw notFound('Contenu introuvable.')
      list.splice(index, 1)
      commit()
    },
    async uploadImage(file) {
      await latency()
      currentUser()
      if (!['image/jpeg', 'image/png'].includes(file.type) || file.size > 5 * 1024 * 1024)
        throw apiError(400, 'Choisissez une image JPEG ou PNG de moins de 5 Mo.')
      // Le vrai backend renvoie /uploads/<nom>.jpg ; ici l'image reste dans le navigateur.
      return readImage(file)
    },
  },

  requests: {
    async submit(kind, values) {
      await latency()
      validateRequest(kind, values)
      const t = (v: unknown) => (typeof v === 'string' ? v.trim() : '')
      const request: SchoolRequest = {
        id: nextId(db().requests),
        reference: reference(kind),
        kind,
        status: INITIAL_STATUS[kind],
        firstName: kind === 'preinscriptions' ? t(values.firstName) : '',
        lastName: kind === 'preinscriptions' ? t(values.lastName) : '',
        birthDate: kind === 'preinscriptions' ? t(values.birthDate) : '',
        cycle: kind === 'preinscriptions' ? t(values.cycle) : '',
        className: kind === 'preinscriptions' ? t(values.className) : '',
        parentName: t(values.parentName),
        email: t(values.email),
        phone: t(values.phone),
        visitDate: kind === 'visites' ? t(values.date) : '',
        slot: kind === 'visites' ? t(values.slot) : '',
        message: t(values.message),
        createdAt: new Date().toISOString(),
      }
      db().requests.push(request)
      commit()
      return { reference: request.reference }
    },
    async list(kind) {
      await latency()
      currentUser()
      return clone(db().requests.filter((r) => r.kind === kind).sort(byNewest))
    },
    async updateStatus(kind, id, status) {
      await latency()
      currentUser()
      if (!REQUEST_STATUSES[kind].includes(status))
        throw apiError(400, 'Statut invalide.', {
          status: 'Statut invalide pour ce type de demande.',
        })
      const item = db().requests.find((r) => r.kind === kind && r.id === id)
      if (!item) throw notFound('Demande introuvable.')
      item.status = status
      commit()
      return clone(item)
    },
    async remove(kind, id) {
      await latency()
      currentUser()
      const list = db().requests
      const index = list.findIndex((r) => r.kind === kind && r.id === id)
      if (index < 0) throw notFound('Demande introuvable.')
      list.splice(index, 1)
      commit()
    },
  },

  users: {
    async list() {
      await latency()
      requireSuperAdmin()
      return db().users.map(publicUser).sort((a, b) => a.id - b.id)
    },
    async create(values) {
      await latency()
      requireSuperAdmin()
      validateUser(values, true)
      const email = values.email.trim().toLowerCase()
      if (db().users.some((u) => u.email === email))
        throw apiError(409, 'Cette adresse email est déjà utilisée.', {
          email: 'Cette adresse email est déjà utilisée.',
        })
      const user: MockUser = {
        id: nextId(db().users),
        name: values.name.trim(),
        email,
        role: values.role,
        active: values.active,
        password: values.password,
      }
      db().users.push(user)
      commit()
      return publicUser(user)
    },
    async update(id, values) {
      await latency()
      requireSuperAdmin()
      const me = currentUser()
      const user = db().users.find((u) => u.id === id)
      if (!user) throw notFound('Utilisateur introuvable.')
      validateUser(values, false)
      const email = values.email.trim().toLowerCase()
      if (db().users.some((u) => u.email === email && u.id !== id))
        throw apiError(409, 'Cette adresse email est déjà utilisée.', {
          email: 'Cette adresse email est déjà utilisée.',
        })
      const staysSuper = values.role === 'SUPER_ADMIN' && values.active
      if (user.role === 'SUPER_ADMIN' && !staysSuper && activeSuperAdmins(user.id) === 0)
        throw apiError(400, 'Il doit rester au moins un super administrateur actif.')
      if (user.id === me.id && !values.active)
        throw apiError(400, 'Vous ne pouvez pas désactiver votre propre compte.')
      Object.assign(user, { name: values.name.trim(), email, role: values.role, active: values.active })
      if (values.password) user.password = values.password
      commit()
      return publicUser(user)
    },
    async remove(id) {
      await latency()
      requireSuperAdmin()
      const me = currentUser()
      const list = db().users
      const index = list.findIndex((u) => u.id === id)
      if (index < 0) throw notFound('Utilisateur introuvable.')
      if (id === me.id) throw apiError(400, 'Vous ne pouvez pas supprimer votre propre compte.')
      if (list[index]!.role === 'SUPER_ADMIN' && activeSuperAdmins(id) === 0)
        throw apiError(400, 'Il doit rester au moins un super administrateur actif.')
      list.splice(index, 1)
      commit()
    },
  },

  dashboard: {
    async get() {
      await latency()
      currentUser()
      const { contents, requests } = db()
      const content = (kind: ContentKind) => ({
        total: contents.filter((c) => c.kind === kind).length,
        published: contents.filter((c) => c.kind === kind && c.published).length,
      })
      const ofKind = (kind: string) => requests.filter((r) => r.kind === kind)
      const pending = (kind: string) => ({
        total: ofKind(kind).length,
        pending: ofKind(kind).filter((r) => r.status === 'PENDING').length,
      })
      return clone({
        actualites: content('actualites'),
        evenements: content('evenements'),
        galerie: content('galerie'),
        preinscriptions: pending('preinscriptions'),
        visites: pending('visites'),
        messages: {
          total: ofKind('messages').length,
          unread: ofKind('messages').filter((r) => r.status === 'UNREAD').length,
        },
        recentRegistrations: ofKind('preinscriptions').sort(byNewest).slice(0, 5),
        recentVisits: ofKind('visites').sort(byNewest).slice(0, 5),
      })
    },
  },
}
