// ============================================================================
//  GABARIT GÉNÉRIQUE
//  Construit le profil complet d'un site à partir des 5 champs du fichier Excel
//  (sites/<id>/site.json). Règle : aucune information n'est inventée.
//   - Les champs absents de l'Excel (email, horaires, tarifs, slogan, histoire…)
//     restent vides et les vues ne les affichent pas.
//   - Logo et photo du responsable : monogrammes générés tant que les vraies
//     images ne sont pas fournies (clés « logo » et « photoResponsable »).
// ============================================================================
import { defaultAdmissions, defaultCycles, defaultHeroImages, defaultValues } from './defaults'
import type { SchoolProfile, SiteData } from './types'

const clean = (v: unknown) => String(v ?? '').replace(/\s+/g, ' ').trim()
/** Majuscule initiale (mise en forme uniquement, le texte n'est pas modifié). */
const capitalize = (s: string) => s.charAt(0).toLocaleUpperCase('fr-FR') + s.slice(1)

function initials(text: string, max = 2) {
  return text
    .split(/[\s'’.-]+/)
    .filter((w) => /\p{L}/u.test(w))
    .slice(0, max)
    .map((w) => w.match(/\p{L}/u)![0].toLocaleUpperCase('fr-FR'))
    .join('')
}

const svgUri = (svg: string) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Logo provisoire : monogramme aux couleurs du modèle. */
function monogramLogo(name: string) {
  return svgUri(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><circle cx="60" cy="60" r="56" fill="#006a4e"/><circle cx="60" cy="60" r="47" fill="none" stroke="#f5c400" stroke-width="4"/><text x="60" y="61" dominant-baseline="central" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="40" fill="#ffffff">${esc(initials(name))}</text></svg>`,
  )
}

/** Photo provisoire du responsable : initiales sur fond clair. */
function portraitPlaceholder(person: string) {
  return svgUri(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 538 538"><rect width="538" height="538" fill="#e0fbf3"/><circle cx="269" cy="269" r="150" fill="#006a4e"/><text x="269" y="271" dominant-baseline="central" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="120" fill="#ffffff">${esc(initials(person))}</text></svg>`,
  )
}

export function buildProfile(id: string, raw: SiteData): SchoolProfile {
  const person = clean(raw['NOM PRENOMS'])
  const role = capitalize(clean(raw.PROFFESSION))
  const phone = clean(raw.CONTACTS)
  const name = clean(raw.ETABLISSEMENTS)
  const place = clean(raw.Quartier)

  const missing = Object.entries({ 'NOM PRENOMS': person, PROFFESSION: role, CONTACTS: phone, ETABLISSEMENTS: name, Quartier: place })
    .filter(([, v]) => !v)
    .map(([k]) => k)
  if (missing.length)
    throw new Error(`Site « ${id} » : champ(s) manquant(s) dans site.json : ${missing.join(', ')}`)

  return {
    id,
    locality: place,
    logo: clean(raw.logo) || monogramLogo(name),
    settings: {
      name,
      shortName: name,
      slogan: '',
      address: place,
      email: '',
      phone,
      phone2: '',
      hours: '',
      annualFee: 0,
      canteenFee: 0,
      badgeFee: 0,
      uniformFee: 0,
      apeFee: 0,
    },
    footerText: 'Un environnement éducatif dédié à l’épanouissement et à la réussite de chaque élève.',
    hero: {
      eyebrow: place.toLocaleUpperCase('fr-FR'),
      titleLines: ['Bienvenue à'],
      highlight: name,
      intro:
        'Bienvenue sur le site officiel de notre établissement, un environnement dédié à l’éducation, à l’épanouissement et à la réussite des élèves.',
      images: defaultHeroImages,
    },
    founder: {
      photo: clean(raw.photoResponsable) || portraitPlaceholder(person),
      photoAlt: `${person}, ${role} — ${name}`,
      eyebrow: 'UN MOT DE LA DIRECTION',
      titleLines: ['Grandir, apprendre,', 'réussir ensemble.'],
      greeting: 'Chers parents, chers élèves,',
      paragraphs: [
        `À ${name}, nous croyons au potentiel de chaque enfant. Notre ambition est de lui offrir un cadre d’apprentissage stimulant et bienveillant.`,
        'Notre équipe éducative accompagne les élèves avec exigence et attention, pour leur permettre de construire un avenir dont ils seront fiers.',
      ],
      signature: person,
      role,
    },
    history: {
      title: 'Notre établissement',
      paragraphs: [
        `${name} est un établissement scolaire situé à ${place}.`,
        `Responsable : ${person}, ${role.charAt(0).toLocaleLowerCase('fr-FR') + role.slice(1)}.`,
        `Pour toute information, contactez l’établissement au ${phone}.`,
      ],
      stats: [
        { value: place, label: 'Quartier' },
        { value: phone, label: 'Contact' },
      ],
    },
    values: defaultValues,
    faq: [
      {
        q: `Où se trouve ${name} ?`,
        a: `L’établissement est situé à ${place}.`,
      },
      {
        q: 'Comment joindre l’établissement ?',
        a: `Par téléphone au ${phone}, ou grâce au formulaire de contact de cette page.`,
        link: { to: '/#contact', label: 'Nous contacter' },
      },
      {
        q: 'Quels sont les frais de scolarité ?',
        a: 'Les frais de scolarité vous sont communiqués directement par l’établissement.',
        link: { to: '/rendez-vous', label: 'Prendre rendez-vous' },
      },
      {
        q: 'Comment préinscrire mon enfant ?',
        a: 'Remplissez le formulaire de préinscription en ligne ; l’établissement reviendra vers vous.',
        link: { to: '/preinscription', label: 'Se préinscrire' },
      },
    ],
    cycles: defaultCycles,
    admissions: defaultAdmissions,
    demoAdminName: `Direction ${name}`,
  }
}
