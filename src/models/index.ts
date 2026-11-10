// Modèles de données partagés par tout le frontend.
// Ils reproduisent EXACTEMENT le JSON renvoyé par le backend (méthodes toJSON() des modèles
// Sequelize dans backend/src/models). Les fake data respectent ces mêmes formes : passer
// des fake data à l'API réelle ne demande donc aucune modification des vues.

/** Types de contenus éditoriaux (table `contents`, champ `kind`). */
export const CONTENT_KINDS = ['actualites', 'evenements', 'galerie'] as const
export type ContentKind = (typeof CONTENT_KINDS)[number]

/** Types de demandes envoyées depuis le site (table `school_requests`, champ `kind`). */
export const REQUEST_KINDS = ['preinscriptions', 'visites', 'messages'] as const
export type RequestKind = (typeof REQUEST_KINDS)[number]

/** Statuts autorisés pour chaque type de demande (identiques au backend). */
export const REQUEST_STATUSES: Record<RequestKind, readonly string[]> = {
  preinscriptions: ['PENDING', 'ACCEPTED', 'REJECTED'],
  visites: ['PENDING', 'CONFIRMED', 'CANCELLED'],
  messages: ['UNREAD', 'READ'],
}

/** Créneaux de visite acceptés par le backend. */
export const VISIT_SLOTS = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00'] as const

/** Paramètres de l'établissement (GET /api/public/settings). */
export interface Settings {
  name: string
  shortName: string
  slogan: string
  address: string
  email: string
  phone: string
  phone2: string
  hours: string
  annualFee: number
  canteenFee: number
  badgeFee: number
  uniformFee: number
  apeFee: number
}

export type AdminRole = 'SUPER_ADMIN' | 'ADMIN'

export interface AdminUser {
  id: number
  name: string
  email: string
  role: AdminRole
  active: boolean
}

/** Données envoyées pour créer / modifier un administrateur (mot de passe vide = inchangé). */
export interface AdminUserInput {
  name: string
  email: string
  role: AdminRole
  active: boolean
  password: string
}

export interface ContentItem {
  id: number
  kind: ContentKind
  title: string
  summary: string
  body: string
  category: string
  eventDate: string
  location: string
  imageUrl: string
  album: string
  cycle: string
  published: boolean
  createdAt: string
}

/** Données envoyées pour créer / modifier un contenu. */
export type ContentInput = Omit<ContentItem, 'id' | 'kind' | 'createdAt' | 'eventDate'> & {
  eventDate: string | null
}

export interface SchoolRequest {
  id: number
  reference: string
  kind: RequestKind
  status: string
  firstName: string
  lastName: string
  birthDate: string
  cycle: string
  className: string
  parentName: string
  email: string
  phone: string
  visitDate: string
  slot: string
  message: string
  createdAt: string
}

/** Formulaire public (préinscription, visite ou message). */
export interface RequestInput {
  firstName?: string
  lastName?: string
  birthDate?: string
  cycle?: string
  className?: string
  parentName: string
  email: string
  phone: string
  date?: string
  slot?: string
  message: string
}

export interface RequestReceipt {
  reference: string
}

/** Tableau de bord de l'administration (GET /api/admin/dashboard). */
export interface DashboardData {
  actualites: { total: number; published: number }
  evenements: { total: number; published: number }
  galerie: { total: number; published: number }
  preinscriptions: { total: number; pending: number }
  visites: { total: number; pending: number }
  messages: { total: number; unread: number }
  recentRegistrations: SchoolRequest[]
  recentVisits: SchoolRequest[]
}

/** Photo affichée dans un carrousel. */
export interface Photo {
  src: string
  alt: string
}
