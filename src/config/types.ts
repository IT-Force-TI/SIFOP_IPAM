// Types du profil d'un établissement (commun à tous les sites).
import type { Settings } from '../models'

export interface CycleProfile {
  /** Nom du cycle. Doit correspondre aux cycles acceptés par le backend (utils/schemas.js). */
  name: string
  /** Segment d'URL de la page d'admission : /admissions/<slug>. */
  slug: string
  age: string
  text: string
  /** Classes proposées. Doivent correspondre aux classes acceptées par le backend. */
  classes: string[]
  skills: string[]
  programs: { icon: string; title: string; text: string }[]
}

export interface SchoolProfile {
  /** Identifiant technique = nom du dossier dans sites/ (sert aussi de clé de stockage des fake data). */
  id: string
  /** Ville ou quartier, utilisé dans les fake data (lieux des événements). */
  locality: string
  logo: string
  /** Valeurs par défaut des paramètres (affichées avant chargement et utilisées par les fake data). */
  settings: Settings
  footerText: string
  hero: { eyebrow: string; titleLines: string[]; highlight: string; intro: string; images: string[] }
  founder: {
    photo: string
    photoAlt: string
    eyebrow: string
    titleLines: string[]
    greeting: string
    paragraphs: string[]
    signature: string
    /** Fonction affichée sous la signature (facultatif). */
    role?: string
  }
  history: { title: string; paragraphs: string[]; stats: { value: string; label: string }[] }
  values: { icon: string; title: string; text: string }[]
  faq: { q: string; a: string; link?: { to: string; label: string } }[]
  cycles: CycleProfile[]
  admissions: { documents: string[] }
  /** Nom du compte administrateur de démonstration (fake data). */
  demoAdminName?: string
  /** Identifiants des comptes de démonstration (fake data). Défaut : comptes @demo.local. */
  demoAccount?: { email: string; password: string; secretariat: string }
}

/**
 * Données d'un site issues du fichier Excel (une ligne = un établissement).
 * Les clés reprennent exactement les en-têtes de colonnes du fichier.
 */
export interface SiteData {
  'NOM PRENOMS': string
  PROFFESSION: string
  CONTACTS: string
  ETABLISSEMENTS: string
  Quartier: string
  /** Facultatif, à ajouter plus tard : chemin d'une image placée dans public/sites/<id>/. */
  logo?: string
  /** Facultatif, à ajouter plus tard : photo du fondateur / responsable. */
  photoResponsable?: string
}
