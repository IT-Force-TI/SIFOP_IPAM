// Contrats des services de données.
// Les vues ne connaissent QUE ces interfaces. Deux implémentations les respectent :
//   - services/mock : fake data (présentations, aucun backend) ;
//   - services/api  : backend Node.js (routes /api/...).
// Pour reconnecter le backend, il suffit de passer VITE_DATA_SOURCE=api.
import type {
  AdminUser,
  AdminUserInput,
  ContentInput,
  ContentItem,
  ContentKind,
  DashboardData,
  RequestInput,
  RequestKind,
  RequestReceipt,
  SchoolRequest,
  Settings,
} from '../models'

export interface AuthService {
  /** POST /api/auth/login */
  login(email: string, password: string): Promise<AdminUser>
  /** POST /api/auth/logout */
  logout(): Promise<void>
  /** GET /api/auth/me — null si personne n'est connecté. */
  me(): Promise<AdminUser | null>
}

export interface SettingsService {
  /** GET /api/public/settings */
  getPublic(): Promise<Settings>
  /** GET /api/admin/settings */
  get(): Promise<Settings>
  /** PUT /api/admin/settings */
  update(values: Settings): Promise<Settings>
}

export interface ContentService {
  /** GET /api/public/content/:kind — contenus publiés uniquement. */
  listPublished(kind: ContentKind): Promise<ContentItem[]>
  /** GET /api/public/content/:kind/:id */
  getPublished(kind: ContentKind, id: number): Promise<ContentItem>
  /** GET /api/admin/content/:kind — y compris les brouillons. */
  list(kind: ContentKind): Promise<ContentItem[]>
  /** POST /api/admin/content/:kind */
  create(kind: ContentKind, values: ContentInput): Promise<ContentItem>
  /** PUT /api/admin/content/:kind/:id */
  update(kind: ContentKind, id: number, values: ContentInput): Promise<ContentItem>
  /** DELETE /api/admin/content/:kind/:id */
  remove(kind: ContentKind, id: number): Promise<void>
  /** POST /api/admin/uploads — renvoie l'adresse de l'image enregistrée. */
  uploadImage(file: File): Promise<string>
}

export interface RequestService {
  /** POST /api/public/requests/:kind — formulaire public, renvoie la référence. */
  submit(kind: RequestKind, values: RequestInput): Promise<RequestReceipt>
  /** GET /api/admin/requests/:kind */
  list(kind: RequestKind): Promise<SchoolRequest[]>
  /** PATCH /api/admin/requests/:kind/:id */
  updateStatus(kind: RequestKind, id: number, status: string): Promise<SchoolRequest>
  /** DELETE /api/admin/requests/:kind/:id */
  remove(kind: RequestKind, id: number): Promise<void>
}

export interface UserService {
  /** GET /api/admin/users (super administrateur) */
  list(): Promise<AdminUser[]>
  /** POST /api/admin/users */
  create(values: AdminUserInput): Promise<AdminUser>
  /** PUT /api/admin/users/:id */
  update(id: number, values: AdminUserInput): Promise<AdminUser>
  /** DELETE /api/admin/users/:id */
  remove(id: number): Promise<void>
}

export interface DashboardService {
  /** GET /api/admin/dashboard */
  get(): Promise<DashboardData>
}

export interface DataServices {
  auth: AuthService
  settings: SettingsService
  content: ContentService
  requests: RequestService
  users: UserService
  dashboard: DashboardService
}
