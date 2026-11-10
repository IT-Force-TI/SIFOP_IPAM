// Implémentation des services avec le backend réel (VITE_DATA_SOURCE=api).
import type { DataServices } from '../contracts'
import type {
  AdminUser,
  ContentItem,
  DashboardData,
  RequestReceipt,
  SchoolRequest,
  Settings,
} from '../../models'
import { ApiError } from '../errors'
import { http, json, resetCsrf } from './http'

export const apiServices: DataServices = {
  auth: {
    async login(email, password) {
      const user = await http<AdminUser>('/auth/login', {
        method: 'POST',
        body: new URLSearchParams({ username: email, password }),
      })
      resetCsrf()
      return user
    },
    async logout() {
      await http<void>('/auth/logout', { method: 'POST' })
      resetCsrf()
    },
    async me() {
      try {
        return await http<AdminUser>('/auth/me')
      } catch (e) {
        if (e instanceof ApiError && e.status === 401) return null
        throw e
      }
    },
  },

  settings: {
    getPublic: () => http<Settings>('/public/settings'),
    get: () => http<Settings>('/admin/settings'),
    update: (values) => http<Settings>('/admin/settings', json('PUT', values)),
  },

  content: {
    listPublished: (kind) => http<ContentItem[]>(`/public/content/${kind}`),
    getPublished: (kind, id) => http<ContentItem>(`/public/content/${kind}/${id}`),
    list: (kind) => http<ContentItem[]>(`/admin/content/${kind}`),
    create: (kind, values) => http<ContentItem>(`/admin/content/${kind}`, json('POST', values)),
    update: (kind, id, values) =>
      http<ContentItem>(`/admin/content/${kind}/${id}`, json('PUT', values)),
    remove: (kind, id) => http<void>(`/admin/content/${kind}/${id}`, { method: 'DELETE' }),
    async uploadImage(file) {
      const body = new FormData()
      body.append('file', file)
      const { url } = await http<{ url: string }>('/admin/uploads', { method: 'POST', body })
      return url
    },
  },

  requests: {
    submit: (kind, values) =>
      http<RequestReceipt>(`/public/requests/${kind}`, json('POST', values)),
    list: (kind) => http<SchoolRequest[]>(`/admin/requests/${kind}`),
    updateStatus: (kind, id, status) =>
      http<SchoolRequest>(`/admin/requests/${kind}/${id}`, json('PATCH', { status })),
    remove: (kind, id) => http<void>(`/admin/requests/${kind}/${id}`, { method: 'DELETE' }),
  },

  users: {
    list: () => http<AdminUser[]>('/admin/users'),
    create: (values) => http<AdminUser>('/admin/users', json('POST', values)),
    update: (id, values) => http<AdminUser>(`/admin/users/${id}`, json('PUT', values)),
    remove: (id) => http<void>(`/admin/users/${id}`, { method: 'DELETE' }),
  },

  dashboard: {
    get: () => http<DashboardData>('/admin/dashboard'),
  },
}
