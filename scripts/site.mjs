// Lance Vite pour un site donné, sous Windows comme sous Linux/macOS.
//   npm run site -- sifop-ipam            → serveur de développement
//   npm run site -- sifop-ipam build      → build dans dist-sites/sifop-ipam
//   npm run site -- sifop-ipam preview    → aperçu du build
//   npm run site -- liste                   → liste des sites disponibles
import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const sites = readdirSync(resolve(root, 'sites'), { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
const [site, action = 'dev', ...rest] = process.argv.slice(2)

if (!site || site === 'liste') {
  console.log('Sites disponibles :\n  ' + sites.join('\n  '))
  console.log('\nUsage : npm run site -- <site> [dev|build|preview]')
  process.exit(site ? 0 : 1)
}
if (!sites.includes(site)) {
  console.error(`Site « ${site} » introuvable. Sites disponibles : ${sites.join(', ')}`)
  process.exit(1)
}
const env = { ...process.env, VITE_SITE: site }
const bin = (name) => resolve(root, 'node_modules', '.bin', process.platform === 'win32' ? name + '.cmd' : name)
const run = (cmd, args) => {
  const r = spawnSync(cmd, args, { cwd: root, env, stdio: 'inherit', shell: process.platform === 'win32' })
  if (r.status) process.exit(r.status)
}
if (!existsSync(bin('vite'))) {
  console.error('Dépendances absentes : lancez d’abord « npm install ».')
  process.exit(1)
}
if (action === 'build') {
  run(bin('vue-tsc'), ['-b'])
  run(bin('vite'), ['build', ...rest])
} else if (action === 'preview') run(bin('vite'), ['preview', '--host', '127.0.0.1', ...rest])
else run(bin('vite'), ['--host', '127.0.0.1', ...rest])
