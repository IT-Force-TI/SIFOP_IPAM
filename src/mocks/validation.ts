// Validation des fake data : reprend les règles et les messages du backend
// (backend/src/utils/schemas.js) pour que la démonstration réagisse comme le vrai site.
import { classesByCycle } from '../config/school'
import { VISIT_SLOTS, type AdminUserInput, type ContentInput, type ContentKind, type RequestInput, type Settings } from '../models'
import { apiError } from '../services/errors'

type Errors = Record<string, string>

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE = /^[+()0-9 .\-]{8,40}$/
const ISO = /^\d{4}-\d{2}-\d{2}$/
const today = () => new Date().toISOString().slice(0, 10)
const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')
const validDate = (v: string) =>
  ISO.test(v) && !Number.isNaN(Date.parse(v + 'T12:00:00Z')) && new Date(v + 'T12:00:00Z').toISOString().startsWith(v)

function required(errors: Errors, field: string, value: string, label: string, max: number, min = 1) {
  if (value.length < min) errors[field] ??= `${label} est obligatoire.`
  else if (value.length > max) errors[field] ??= `${label} est trop long (${max} caractères maximum).`
}

function email(errors: Errors, value: string) {
  if (!value) errors.email ??= "L'adresse email est obligatoire."
  else if (!EMAIL.test(value) || value.length > 254) errors.email ??= "L'adresse email est invalide."
}

function fail(errors: Errors) {
  if (Object.keys(errors).length)
    throw apiError(400, 'Veuillez corriger les champs indiqués.', errors)
}

export function validateRequest(kind: string, input: RequestInput) {
  const errors: Errors = {}
  const v = {
    parentName: str(input.parentName),
    email: str(input.email),
    phone: str(input.phone),
    message: str(input.message),
  }
  if (kind === 'preinscriptions') {
    required(errors, 'firstName', str(input.firstName), "Le prénom de l'élève", 100)
    required(errors, 'lastName', str(input.lastName), "Le nom de l'élève", 100)
    const birth = str(input.birthDate)
    if (!birth) errors.birthDate = 'La date de naissance est obligatoire.'
    else if (!validDate(birth) || birth > today() || birth < '2001-01-01')
      errors.birthDate = 'La date de naissance est invalide.'
    const cycle = str(input.cycle)
    if (!classesByCycle[cycle]) errors.cycle = 'Le cycle est invalide.'
    else if (!classesByCycle[cycle]!.includes(str(input.className)))
      errors.className = 'La classe ne correspond pas au cycle choisi.'
    required(errors, 'parentName', v.parentName, 'Le nom du responsable', 160, 2)
  } else required(errors, 'parentName', v.parentName, 'Le nom', 160, 2)
  email(errors, v.email)
  if (kind === 'messages') {
    if (v.phone && !PHONE.test(v.phone)) errors.phone = 'Le numéro de téléphone est invalide.'
    required(errors, 'message', v.message, 'Le message', 4000, 5)
  } else {
    if (!v.phone) errors.phone = 'Le téléphone est obligatoire.'
    else if (!PHONE.test(v.phone)) errors.phone = 'Le numéro de téléphone est invalide.'
    if (v.message.length > 4000) errors.message = 'Texte trop long (4000 caractères maximum).'
  }
  if (kind === 'visites') {
    const date = str(input.date)
    const max = new Date()
    max.setFullYear(max.getFullYear() + 1)
    if (!validDate(date) || date < today() || date > max.toISOString().slice(0, 10))
      errors.date = 'La date de visite doit être comprise dans les 12 prochains mois.'
    if (!(VISIT_SLOTS as readonly string[]).includes(str(input.slot)))
      errors.slot = 'Le créneau est invalide.'
  }
  fail(errors)
}

export function validateContent(kind: ContentKind, input: ContentInput) {
  const errors: Errors = {}
  required(errors, 'title', str(input.title), 'Le titre', 200)
  if (str(input.summary).length > 500) errors.summary = 'Texte trop long (500 caractères maximum).'
  const date = str(input.eventDate)
  if (date && !validDate(date)) errors.eventDate = "La date de l'événement est invalide."
  if (kind === 'evenements' && !date) errors.eventDate = "La date de l'événement est obligatoire."
  if (kind === 'galerie' && !str(input.imageUrl))
    errors.imageUrl = 'Une image est obligatoire pour la galerie.'
  fail(errors)
}

export function validateSettings(input: Settings) {
  const errors: Errors = {}
  required(errors, 'name', str(input.name), "Le nom de l'établissement", 200)
  required(errors, 'shortName', str(input.shortName), 'Le nom court', 60)
  required(errors, 'slogan', str(input.slogan), 'Le slogan', 200)
  required(errors, 'address', str(input.address), "L'adresse", 300)
  email(errors, str(input.email))
  required(errors, 'phone', str(input.phone), 'Le téléphone', 40, 6)
  required(errors, 'hours', str(input.hours), 'Les horaires', 200)
  for (const key of ['annualFee', 'canteenFee', 'badgeFee', 'uniformFee', 'apeFee'] as const) {
    const n = Number(input[key])
    if (!Number.isInteger(n) || n < 0) errors[key] = 'Montant invalide.'
  }
  fail(errors)
}

export function validateUser(input: AdminUserInput, creating: boolean) {
  const errors: Errors = {}
  required(errors, 'name', str(input.name), 'Le nom', 120, 2)
  email(errors, str(input.email))
  if (!['ADMIN', 'SUPER_ADMIN'].includes(input.role)) errors.role = 'Rôle invalide.'
  const password = input.password || ''
  if (creating && !password) errors.password = 'Le mot de passe est obligatoire.'
  else if (password && password.length < 12)
    errors.password = 'Le mot de passe doit contenir au moins 12 caractères.'
  else if (password.length > 72)
    errors.password = 'Le mot de passe est trop long (72 caractères maximum).'
  fail(errors)
}
