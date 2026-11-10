import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'

// ---------------------------------------------------------------------------
//  Multi-sites : un seul frontend, un dossier de données par établissement.
//  Le site est choisi par VITE_SITE (variable d'environnement, .env.local, ou
//  `npm run site -- <id>`). Défaut : sifop-ipam.
//  Seul le dossier sites/<id>/ choisi est compilé : aucun autre site n'est inclus.
// ---------------------------------------------------------------------------
const ROOT = dirname(fileURLToPath(import.meta.url))
const SITES_DIR = resolve(ROOT, 'sites')
const DEFAULT_SITE = 'sifop-ipam'
const posix = (p: string) => p.replace(/\\/g, '/')

function siteFiles(site: string) {
  const dir = resolve(SITES_DIR, site)
  const profile = resolve(dir, 'profile.ts')
  const json = resolve(dir, 'site.json')
  if (!/^[a-z0-9][a-z0-9-]*$/.test(site) || !existsSync(dir)) {
    const list = readdirSync(SITES_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
    throw new Error(`Site « ${site} » introuvable dans sites/. Sites disponibles : ${list.join(', ')}`)
  }
  if (existsSync(profile)) return { profile }
  if (existsSync(json)) return { json }
  throw new Error(`sites/${site}/ doit contenir site.json (données Excel) ou profile.ts.`)
}

function sitePlugin(site: string): Plugin {
  const VIRTUAL = 'virtual:site'
  const files = siteFiles(site)
  return {
    name: 'school-site',
    resolveId: (id) => (id === VIRTUAL ? '\0' + VIRTUAL : null),
    load(id) {
      if (id !== '\0' + VIRTUAL) return null
      if (files.profile) return `export { default } from ${JSON.stringify(posix(files.profile))}`
      const template = posix(resolve(ROOT, 'src/config/site-template.ts'))
      return [
        `import data from ${JSON.stringify(posix(files.json!))}`,
        `import { buildProfile } from ${JSON.stringify(template)}`,
        `export default buildProfile(${JSON.stringify(site)}, data)`,
      ].join('\n')
    },
    // Titre et description de la page pour les sites issus de l'Excel.
    transformIndexHtml(html) {
      if (!files.json) return html
      const d = JSON.parse(readFileSync(files.json, 'utf-8'))
      const attr = (s: string) =>
        String(s ?? '').replace(/\s+/g, ' ').trim().replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
      const name = attr(d.ETABLISSEMENTS)
      return html
        .replace(/<title>[^<]*<\/title>/, `<title>${name}</title>`)
        .replace(
          /<meta name="description" content="[^"]*">/,
          `<meta name="description" content="${name} — établissement scolaire à ${attr(d.Quartier)}.">`,
        )
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ROOT, '')
  const site = (process.env.VITE_SITE || env.VITE_SITE || DEFAULT_SITE).trim()
  return {
    plugins: [vue(), sitePlugin(site)],
    // Chaque site a son propre dossier de sortie : un build n'écrase jamais celui d'un autre.
    build: { outDir: site === DEFAULT_SITE ? 'dist' : `dist-sites/${site}` },
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': { target: process.env.API_TARGET || 'http://127.0.0.1:8080' },
        '/uploads': { target: process.env.API_TARGET || 'http://127.0.0.1:8080' },
      },
    },
    preview: {
      port: 4173,
      proxy: {
        '/api': { target: process.env.API_TARGET || 'http://127.0.0.1:8080' },
        '/uploads': { target: process.env.API_TARGET || 'http://127.0.0.1:8080' },
      },
    },
  }
})
