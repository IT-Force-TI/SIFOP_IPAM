// ============================================================================
//  CONTENU COMMUN À TOUS LES SITES
//  Textes génériques du modèle (valeurs, cycles, pièces d'admission, images du héros).
//  Ils ne contiennent aucune information propre à un établissement.
//  Un site peut les remplacer dans son propre dossier (sites/<id>/).
// ============================================================================
import type { CycleProfile, SchoolProfile } from './types'

/** Images du carrousel d'accueil (dossier public/hero). */
export const defaultHeroImages = ['/hero/hero-1.jpg', '/hero/hero-2.jpg', '/hero/hero-3.jpg']

export const defaultValues: SchoolProfile['values'] = [
  {
    icon: 'graduation',
    title: 'Excellence académique',
    text: 'Nous visons l’excellence dans tous les domaines d’apprentissage.',
  },
  {
    icon: 'heart',
    title: 'Bienveillance',
    text: 'Un environnement d’apprentissage chaleureux et respectueux.',
  },
  { icon: 'idea', title: 'Innovation', text: 'Des méthodes pédagogiques modernes et innovantes.' },
  { icon: 'users', title: 'Communauté', text: 'Une communauté éducative unie et engagée.' },
]

export const defaultCycles: CycleProfile[] = [
  {
    name: 'Maternelle',
    slug: 'maternelle',
    age: '3 à 6 ans',
    text: 'La maternelle constitue la première étape du parcours scolaire. Elle favorise l’éveil, la socialisation, l’autonomie et les premiers apprentissages.',
    classes: ['Petite section', 'Moyenne section', 'Grande section'],
    skills: [
      'Éveil et expression corporelle',
      'Développement du langage',
      'Découverte des nombres et des formes',
      'Apprentissage de la vie en groupe',
    ],
    programs: [
      {
        icon: 'idea',
        title: 'Éveil artistique',
        text: 'Dessin, peinture, activités manuelles et créativité.',
      },
      {
        icon: 'heart',
        title: 'Musique et expression',
        text: 'Comptines, chants, rythmes et jeux de mouvement.',
      },
      {
        icon: 'book',
        title: 'Premiers apprentissages',
        text: 'Découvrir, expérimenter et apprendre en jouant.',
      },
    ],
  },
  {
    name: 'Primaire',
    slug: 'primaire',
    age: '6 à 12 ans',
    text: 'Le primaire consolide les apprentissages fondamentaux et développe la curiosité. Chaque élève progresse dans un cadre structuré, bilingue et bienveillant.',
    classes: ['CP1', 'CP2', 'CE1', 'CE2', 'CM1', 'CM2'],
    skills: [
      'Lecture, écriture et expression orale',
      'Mathématiques et raisonnement logique',
      'Ouverture aux sciences et au monde',
      'Pratique progressive du français et de l’anglais',
    ],
    programs: [
      {
        icon: 'book',
        title: 'Savoirs fondamentaux',
        text: 'Lecture, écriture et mathématiques au quotidien.',
      },
      {
        icon: 'idea',
        title: 'Sciences et découverte',
        text: 'Observer, comprendre et développer sa curiosité.',
      },
      {
        icon: 'users',
        title: 'Sport et coopération',
        text: 'Apprendre le respect, l’esprit d’équipe et l’autonomie.',
      },
    ],
  },
  {
    name: 'Collège',
    slug: 'college',
    age: '12 à 16 ans',
    text: 'Le collège prépare les élèves à poursuivre leurs études avec confiance. Les enseignements approfondissent les connaissances, les méthodes de travail et l’esprit critique.',
    classes: ['6e', '5e', '4e', '3e'],
    skills: [
      'Enseignements généraux approfondis',
      'Méthodologie et autonomie',
      'Accompagnement et suivi des progrès',
      'Préparation aux examens et à l’orientation',
    ],
    programs: [
      {
        icon: 'graduation',
        title: 'Excellence académique',
        text: 'Des enseignements exigeants et un suivi régulier.',
      },
      {
        icon: 'book',
        title: 'Langues et culture',
        text: 'S’exprimer et s’ouvrir à de nouveaux horizons.',
      },
      {
        icon: 'shield',
        title: 'Préparer l’avenir',
        text: 'Construire son projet et développer ses compétences.',
      },
    ],
  },
]

export const defaultAdmissions: SchoolProfile['admissions'] = {
  documents: [
    'Une (1) copie légalisée de l’acte de naissance ou un jugement supplétif légalisé (dossier scolaire pour tout le cycle)',
    'Un (1) certificat de scolarité',
    'Les bulletins de notes de l’année écoulée (sauf pour enfant entrant en Maternelle 1)',
    'Un carnet de correspondance (pour la réinscription)',
    'Une (1) chemise dossier à rabat',
    'Un (1) carnet de santé',
  ],
}
