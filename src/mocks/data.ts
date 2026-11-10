// FAKE DATA — contenu de démonstration utilisé quand VITE_DATA_SOURCE=mock.
// Les formes sont identiques aux réponses du backend (voir src/models).
// Les dates sont relatives au jour de la présentation pour que la démo reste « à jour ».
import { school } from '../config/school'
import type { AdminRole, ContentItem, SchoolRequest, Settings } from '../models'

const DAY = 24 * 60 * 60 * 1000
/** Date AAAA-MM-JJ décalée de `days` jours par rapport à aujourd'hui. */
export const isoDay = (days: number) => new Date(Date.now() + days * DAY).toISOString().slice(0, 10)
/** Horodatage ISO décalé de `days` jours (et `hours` heures). */
const stamp = (days: number, hours = 9) =>
  new Date(new Date(isoDay(days) + 'T00:00:00Z').getTime() + hours * 3600_000).toISOString()

const photo = (n: number) => `/media/photo-${((n - 1) % 6) + 1}.jpg`

/** Compte de démonstration de l'administration (mode fake data uniquement). */
export const DEMO_ACCOUNT = {
  email: school.demoAccount?.email || 'direction@demo.local',
  password: school.demoAccount?.password || 'Demo2026!',
}

export interface MockUser {
  id: number
  name: string
  email: string
  role: AdminRole
  active: boolean
  /** Fake data uniquement : le vrai backend stocke un hachage bcrypt. */
  password: string
}

export function seedSettings(): Settings {
  return { ...school.settings }
}

export function seedUsers(): MockUser[] {
  return [
    {
      id: 1,
      name: school.demoAdminName || `Direction ${school.settings.shortName}`,
      email: DEMO_ACCOUNT.email,
      role: 'SUPER_ADMIN',
      active: true,
      password: DEMO_ACCOUNT.password,
    },
    {
      id: 2,
      name: 'Secrétariat',
      email: school.demoAccount?.secretariat || 'secretariat@demo.local',
      role: 'ADMIN',
      active: true,
      password: 'Secretariat2026!',
    },
  ]
}

const blank = {
  summary: '',
  body: '',
  category: '',
  eventDate: '',
  location: '',
  imageUrl: '',
  album: '',
  cycle: '',
  published: true,
}

export function seedContents(): ContentItem[] {
  let id = 0
  const items: ContentItem[] = []
  const add = (item: Partial<ContentItem> & Pick<ContentItem, 'kind' | 'title'>, createdDays = -30) =>
    items.push({ ...blank, createdAt: stamp(createdDays), ...item, id: ++id })

  // --- Actualités ---
  const news: [string, string, number, number, string, string][] = [
    [
      'Une nouvelle année scolaire se prépare',
      'Informations',
      1,
      -3,
      'Les familles peuvent dès maintenant découvrir les cycles de l’école et préparer une demande de préinscription.',
      'Les équipes de l’établissement se préparent à accueillir les élèves pour une nouvelle année scolaire.\n\nLes familles peuvent consulter les informations sur les cycles et transmettre une demande de préinscription depuis le site. Le secrétariat reste disponible pour toute question.',
    ],
    [
      'La journée sportive rassemble les classes',
      'Événements',
      3,
      -12,
      'Courses, jeux collectifs et compétitions amicales ont réuni les élèves du CP1 à la 3e.',
      'La journée sportive inter-classes s’est déroulée dans une ambiance joyeuse, dans le respect des valeurs de discipline, de travail et de réussite.\n\nBravo à tous les participants et merci aux parents venus les encourager.',
    ],
    [
      'Une semaine culturelle placée sous le signe du partage',
      'Vie scolaire',
      2,
      -40,
      'Les élèves explorent les traditions, les arts et les langues à travers des activités préparées en classe.',
      'Danses et chants traditionnels, expositions, défilé en tenues traditionnelles et concours d’élocution ont rythmé cette semaine culturelle.',
    ],
    [
      'Célébration de la fête de l’indépendance',
      'Vie scolaire',
      4,
      -75,
      'Levée des couleurs, chants patriotiques et saynètes pour célébrer le 27 avril.',
      'Les élèves ont présenté chants patriotiques et saynètes devant leurs familles et l’équipe pédagogique.',
    ],
  ]
  for (const [title, category, img, days, summary, body] of news)
    add({ kind: 'actualites', title, category, imageUrl: photo(img), summary, body }, days)
  add(
    {
      kind: 'actualites',
      title: 'Brouillon : calendrier des examens',
      category: 'Informations',
      summary: 'Exemple de contenu non publié, visible uniquement dans l’administration.',
      published: false,
    },
    -1,
  )

  // --- Événements (dates relatives : toujours des « prochains » et des « passés ») ---
  const events: [string, number, string, string, string, number][] = [
    ['Journée portes ouvertes', 12, `Campus de l’école, ${school.locality}`, 'Admissions', 'Parents et futurs élèves visitent les classes, rencontrent l’équipe pédagogique et découvrent les activités proposées.', 1],
    ['Fête de fin d’année et remise des prix', 40, `Cour de l’école, ${school.locality}`, 'Vie scolaire', 'Spectacles préparés par les élèves, remise des prix d’excellence et moment de convivialité avec les familles.', 5],
    ['Concours d’orthographe et de lecture bilingue', 25, `Salle polyvalente, ${school.locality}`, 'Pédagogie', 'Dictée, lecture et expression orale en français et en anglais.', 4],
    ['Journée sportive inter-classes', -12, `Terrain de l’école, ${school.locality}`, 'Sport', 'Courses, jeux collectifs et compétitions amicales entre les classes, du CP1 à la 3e.', 3],
    ['Rentrée scolaire', -55, `Cour de l’école, ${school.locality}`, 'Vie scolaire', 'Accueil des élèves en tenue, levée des couleurs et présentation de l’équipe pédagogique.', 2],
    ['Semaine culturelle', -40, `Campus de l’école, ${school.locality}`, 'Culture', 'Danses et chants traditionnels, expositions, défilé en tenues traditionnelles.', 6],
  ]
  for (const [title, days, location, category, summary, img] of events)
    add(
      { kind: 'evenements', title, eventDate: isoDay(days), location, category, summary, imageUrl: photo(img) },
      Math.min(days, 0) - 20,
    )

  // --- Galerie : un album par classe, 3 photos chacun ---
  school.cycles.forEach((cycle, c) =>
    cycle.classes.forEach((className, i) => {
      const album = cycle.name === 'Maternelle' ? className : `Classe de ${className}`
      for (let k = 0; k < 3; k++)
        add(
          {
            kind: 'galerie',
            title: `${album} — photo ${k + 1}`,
            album,
            cycle: cycle.name,
            imageUrl: photo(c * 2 + i + k * 2 + 1),
          },
          -60 + i,
        )
    }),
  )
  return items
}

export function seedRequests(): SchoolRequest[] {
  const base = {
    firstName: '',
    lastName: '',
    birthDate: '',
    cycle: '',
    className: '',
    phone: '',
    visitDate: '',
    slot: '',
    message: '',
  }
  const year = new Date().getFullYear()
  const list: Omit<SchoolRequest, 'id'>[] = [
    { ...base, kind: 'preinscriptions', reference: `PRE-${year}-K7M2QX`, status: 'PENDING', firstName: 'Amina', lastName: 'Mensah', birthDate: '2018-03-14', cycle: 'Primaire', className: 'CE1', parentName: 'Marie Mensah', email: 'marie.mensah@example.com', phone: '+228 90 11 22 33', message: 'Nous arrivons de Kara et souhaitons une place pour la rentrée.', createdAt: stamp(-1, 10) },
    { ...base, kind: 'preinscriptions', reference: `PRE-${year}-3HD8WA`, status: 'ACCEPTED', firstName: 'Kofi', lastName: 'Agbeko', birthDate: '2013-09-02', cycle: 'Collège', className: '6e', parentName: 'Yao Agbeko', email: 'yao.agbeko@example.com', phone: '+228 91 44 55 66', createdAt: stamp(-6, 15) },
    { ...base, kind: 'preinscriptions', reference: `PRE-${year}-P4ZN6R`, status: 'PENDING', firstName: 'Léa', lastName: 'Kouassi', birthDate: '2021-01-20', cycle: 'Maternelle', className: 'Moyenne section', parentName: 'Ama Kouassi', email: 'ama.kouassi@example.com', phone: '+228 92 77 88 99', createdAt: stamp(-9, 8) },
    { ...base, kind: 'visites', reference: `VIS-${year}-T9BC4E`, status: 'PENDING', parentName: 'Komla Adjo', email: 'komla.adjo@example.com', phone: '+228 93 12 34 56', visitDate: isoDay(5), slot: '09:00', message: 'Visite avec mes deux enfants.', createdAt: stamp(-2, 11) },
    { ...base, kind: 'visites', reference: `VIS-${year}-6WQ2HN`, status: 'CONFIRMED', parentName: 'Essi Lawson', email: 'essi.lawson@example.com', phone: '+228 98 65 43 21', visitDate: isoDay(8), slot: '14:00', createdAt: stamp(-4, 16) },
    { ...base, kind: 'messages', reference: `MSG-${year}-R2XK8D`, status: 'UNREAD', parentName: 'Afi Dossou', email: 'afi.dossou@example.com', phone: '+228 97 11 00 22', message: 'Bonjour, proposez-vous un service de transport scolaire vers Agoè ?', createdAt: stamp(0, 7) },
    { ...base, kind: 'messages', reference: `MSG-${year}-M5JV3T`, status: 'READ', parentName: 'Paul Amegah', email: 'paul.amegah@example.com', message: 'Merci pour l’accueil lors de la journée portes ouvertes.', createdAt: stamp(-10, 13) },
  ]
  return list.map((r, i) => ({ ...r, id: i + 1 }))
}
