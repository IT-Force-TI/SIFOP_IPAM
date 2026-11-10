// Crée les dossiers sites/<id>/site.json à partir du fichier Excel.
//
// 1) Dans Excel : Fichier > Enregistrer sous > « CSV UTF-8 (délimité par des virgules) ».
// 2) npm run site:nouveau -- chemin/vers/fichier.csv
//
// Chaque ligne devient un site. L'identifiant (nom du dossier) est dérivé du nom de
// l'établissement : « SIFOP - IPAM » → sifop-ipam. Un site existant n'est jamais
// écrasé (ajoutez --remplacer pour le mettre à jour). Les valeurs sont recopiées
// telles quelles (espaces superflus retirés), sans aucune autre modification.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const FIELDS = ['NOM PRENOMS', 'PROFFESSION', 'CONTACTS', 'ETABLISSEMENTS', 'Quartier']
const norm = (s) =>
  String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/gi, '').toLowerCase()
// Variantes d'en-têtes acceptées (ex. « PROFESSION » sans double F, « Nom et prénoms »).
const ALIASES = {
  'NOM PRENOMS': ['nomprenoms', 'nometprenoms', 'nomprenom', 'responsable'],
  PROFFESSION: ['proffession', 'profession', 'fonction'],
  CONTACTS: ['contacts', 'contact', 'telephone', 'tel'],
  ETABLISSEMENTS: ['etablissements', 'etablissement', 'ecole'],
  Quartier: ['quartier', 'localisation', 'ville'],
}
export const slug = (s) =>
  String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

function parseCsv(text) {
  text = text.replace(/^﻿/, '')
  const first = text.split(/\r?\n/)[0]
  const sep = [';', '\t', ','].sort((a, b) => first.split(b).length - first.split(a).length)[0]
  const rows = []
  let row = [], cell = '', quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') (cell += '"'), i++
      else if (c === '"') quoted = false
      else cell += c
    } else if (c === '"') quoted = true
    else if (c === sep) row.push(cell), (cell = '')
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(cell), rows.push(row), (row = []), (cell = '')
    } else cell += c
  }
  if (cell || row.length) row.push(cell), rows.push(row)
  return rows.filter((r) => r.some((c) => c.trim()))
}

const args = process.argv.slice(2)
const replace = args.includes('--remplacer')
const file = args.find((a) => !a.startsWith('--'))
if (!file) {
  console.error('Usage : npm run site:nouveau -- fichier.csv [--remplacer]')
  process.exit(1)
}
const [header, ...lines] = parseCsv(readFileSync(resolve(file), 'utf-8'))
const index = {}
for (const field of FIELDS) {
  const i = header.findIndex((h) => ALIASES[field].includes(norm(h)))
  if (i < 0) {
    console.error(`Colonne « ${field} » introuvable. En-têtes lus : ${header.join(' | ')}`)
    process.exit(1)
  }
  index[field] = i
}
let created = 0
for (const [n, line] of lines.entries()) {
  const data = Object.fromEntries(FIELDS.map((f) => [f, String(line[index[f]] ?? '').replace(/\s+/g, ' ').trim()]))
  const missing = FIELDS.filter((f) => !data[f])
  if (missing.length) {
    console.warn(`Ligne ${n + 2} ignorée : champ(s) vide(s) ${missing.join(', ')} — aucune valeur n'est inventée.`)
    continue
  }
  const id = slug(data.ETABLISSEMENTS)
  const dir = resolve(root, 'sites', id)
  const target = resolve(dir, 'site.json')
  if (existsSync(target) && !replace) {
    console.warn(`Ligne ${n + 2} : sites/${id}/ existe déjà (non modifié, utilisez --remplacer).`)
    continue
  }
  mkdirSync(dir, { recursive: true })
  writeFileSync(target, JSON.stringify(data, null, 2) + '\n', 'utf-8')
  console.log(`✔ sites/${id}/site.json  (${data.ETABLISSEMENTS} — ${data.Quartier})`)
  created++
}
console.log(`\n${created} site(s) écrit(s). Lancer : npm run site -- <id>`)
