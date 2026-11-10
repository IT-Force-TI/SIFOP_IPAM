import { createRouter, createWebHistory } from 'vue-router'
import { school as profile } from './config/school'
import { CONTENT_KINDS, REQUEST_KINDS } from './models'
import { loadUser } from './stores/auth'
import { school } from './stores/school'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(to, from, saved) {
    if (saved) return saved
    if (to.hash) return { el: to.hash, top: 120, behavior: 'smooth' }
    if (to.path === from.path) return
    return { top: 0 }
  },
  routes: [
    {
      path: '/',
      component: () => import('./layouts/PublicLayout.vue'),
      children: [
        {
          path: '',
          component: () => import('./views/public/Home.vue'),
          meta: { title: 'Accueil' },
        },
        {
          path: 'cycles',
          component: () => import('./views/public/Cycles.vue'),
          meta: { title: 'Nos cycles' },
        },
        {
          path: 'admissions',
          component: () => import('./views/public/Admissions.vue'),
          meta: { title: 'Admissions' },
        },
        // Une page d'admission par cycle déclaré dans le profil de l'établissement.
        ...profile.cycles.map((cycle) => ({
          path: `admissions/${cycle.slug}`,
          component: () => import('./views/public/Admissions.vue'),
          props: { cycle: cycle.name },
          meta: { title: `Admissions ${cycle.name}` },
        })),
        {
          path: 'tarifs',
          component: () => import('./views/public/Fees.vue'),
          meta: { title: 'Tarifs et scolarité' },
        },
        {
          path: 'actualites',
          component: () => import('./views/public/News.vue'),
          meta: { title: 'Actualités' },
        },
        {
          path: 'actualites/:id',
          component: () => import('./views/public/Article.vue'),
          meta: { title: 'Actualité' },
        },
        {
          path: 'medias',
          component: () => import('./views/public/Media.vue'),
          meta: { title: 'Médias' },
        },
        {
          path: 'preinscription',
          component: () => import('./views/public/Request.vue'),
          props: { kind: 'preinscriptions' },
          meta: { title: 'Préinscription' },
        },
        {
          path: 'rendez-vous',
          component: () => import('./views/public/Request.vue'),
          props: { kind: 'visites' },
          meta: { title: 'Prendre rendez-vous' },
        },
        {
          path: ':pathMatch(.*)*',
          component: () => import('./views/public/NotFound.vue'),
          meta: { title: 'Page introuvable' },
        },
      ],
    },
    {
      path: '/admin/connexion',
      component: () => import('./views/admin/Login.vue'),
      meta: { title: 'Connexion administrateur' },
    },
    {
      path: '/admin',
      component: () => import('./layouts/AdminLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          component: () => import('./views/admin/Dashboard.vue'),
          meta: { title: 'Tableau de bord' },
        },
        ...CONTENT_KINDS.map((kind) => ({
          path: kind,
          component: () => import('./views/admin/Content.vue'),
          props: { kind },
          meta: {
            title: (
              { actualites: 'Actualités', evenements: 'Événements', galerie: 'Galerie' } as Record<
                string,
                string
              >
            )[kind],
          },
        })),
        ...REQUEST_KINDS.map((kind) => ({
          path: kind,
          component: () => import('./views/admin/Requests.vue'),
          props: { kind },
          meta: {
            title: (
              {
                preinscriptions: 'Préinscriptions',
                visites: 'Visites',
                messages: 'Messages',
              } as Record<string, string>
            )[kind],
          },
        })),
        {
          path: 'parametres',
          component: () => import('./views/admin/Settings.vue'),
          meta: { title: 'Paramètres' },
        },
        {
          path: 'utilisateurs',
          component: () => import('./views/admin/Users.vue'),
          meta: { title: 'Utilisateurs', superAdmin: true },
        },
      ],
    },
  ],
})
router.beforeEach(async (to) => {
  if (to.meta.requiresAuth) {
    try {
      const user = await loadUser()
      if (!user) return { path: '/admin/connexion', query: { redirect: to.fullPath } }
      if (to.meta.superAdmin && user.role !== 'SUPER_ADMIN') return '/admin'
    } catch {
      return { path: '/admin/connexion', query: { error: 'server' } }
    }
  }
})
router.afterEach((to) => {
  document.title = `${to.meta.title || 'Accueil'} | ${school.value.shortName}`
})
export default router
