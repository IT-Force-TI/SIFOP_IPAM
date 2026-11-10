import { test, expect } from '@playwright/test'

const stamp = Date.now().toString()
// Les fake data vivent dans le navigateur : les scénarios qui ont besoin d'un vrai serveur
// (deux navigateurs partageant les mêmes données, panne réseau) ne tournent qu'avec E2E_API=1.
const needsBackend = () => test.skip(!process.env.E2E_API, 'Nécessite le backend (E2E_API=1).')
async function login(page: import('@playwright/test').Page) {
  await page.goto('/admin/connexion')
  await page.getByLabel('Adresse email').fill('direction@demo.local')
  await page.getByLabel('Mot de passe', { exact: true }).fill('Demo2026!')
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await expect(page.getByRole('heading', { name: 'Tableau de bord', exact: true })).toBeVisible()
}

test('navigation publique et affichage mobile sans débordement', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Complexe Scolaire')
  await page.getByRole('link', { name: 'Nos cycles', exact: true }).first().click()
  await page.getByRole('button', { name: 'Primaire', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Cycle Primaire' })).toBeVisible()
  await page.goto('/tarifs')
  await expect(page.getByText('Sur demande').first()).toBeVisible()
  await page.setViewportSize({ width: 390, height: 844 })
  for (const path of [
    '/',
    '/cycles',
    '/tarifs',
    '/admissions',
    '/preinscription',
    '/rendez-vous',
    '/actualites',
    '/medias',
  ]) {
    await page.goto(path)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBeTruthy()
  }
  expect(errors).toEqual([])
})

test('préinscription enregistrée puis acceptée par l’administration', async ({ page }) => {
  await page.goto('/preinscription')
  await page.getByLabel('Prénom de l’élève').fill('Amina')
  await page.getByLabel(/^Nom de l’élève/).fill('Test-' + stamp)
  await page.getByLabel('Date de naissance').fill('2017-04-20')
  await page.getByLabel('Cycle demandé').selectOption('Primaire')
  await page.getByLabel('Classe souhaitée').selectOption('CE2')
  await page.getByLabel('Nom du responsable').fill('Marie Test')
  await page.getByLabel('Adresse email').fill('marie@example.com')
  await page.getByLabel('Téléphone').fill('+228 90112233')
  await page.getByLabel('Je confirme').check()
  await page.getByRole('button', { name: 'Envoyer la préinscription' }).click()
  await expect(page.getByRole('heading', { name: 'Votre demande a bien été reçue' })).toBeVisible()
  await expect(page.getByTestId('reference')).toHaveText(/^PRE-\d{4}-[A-Z0-9]{6}$/)
  await login(page)
  await page.getByRole('link', { name: 'Préinscriptions', exact: true }).click()
  await page.getByLabel('Rechercher').fill('Test-' + stamp)
  await page.getByRole('button', { name: 'Consulter' }).first().click()
  await expect(page.getByRole('dialog')).toContainText('Marie Test')
  await page
    .getByRole('dialog')
    .getByLabel(/^Statut/)
    .selectOption('ACCEPTED')
  await page.getByRole('button', { name: 'Enregistrer le statut' }).click()
  await expect(page.getByRole('status')).toContainText('Statut enregistré')
  await page.reload()
  await expect(
    page
      .getByRole('row')
      .filter({ hasText: 'Test-' + stamp })
      .getByText('Acceptée', { exact: true }),
  ).toBeVisible()
})

test('actualité créée en brouillon puis publiée et visible sur le site', async ({ page }) => {
  const title = 'Rentrée scolaire ' + stamp
  await login(page)
  await page.getByRole('link', { name: 'Actualités', exact: true }).click()
  await page.getByRole('button', { name: 'Créer une actualité' }).first().click()
  await page.getByLabel(/^Titre/).fill(title)
  await page.getByLabel('Résumé').fill('Bienvenue pour une nouvelle année scolaire.')
  await page
    .getByLabel('Contenu')
    .fill('Les inscriptions sont ouvertes. Notre équipe vous accueille à l’école.')
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Contenu enregistré')
  await page.goto('/actualites')
  await expect(page.getByText(title, { exact: true })).toHaveCount(0)
  await page.goto('/admin/actualites')
  await page.getByLabel('Rechercher').fill(title)
  await page.getByRole('button', { name: 'Modifier' }).click()
  await page.getByLabel('Publié sur le site').check()
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Contenu enregistré')
  await page.goto('/actualites')
  await expect(page.getByRole('heading', { name: title })).toBeVisible()
  await page
    .locator('article')
    .filter({ has: page.getByRole('heading', { name: title }) })
    .getByRole('link', { name: 'Lire l’article' })
    .click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(title)
})

test('demande de visite et message de contact consultables', async ({ page }) => {
  await page.goto('/rendez-vous')
  await page.getByLabel('Nom du responsable').fill('Visiteur-' + stamp)
  await page.getByLabel('Adresse email').fill('visite@example.com')
  await page.getByLabel('Téléphone').fill('90112233')
  const date = new Date()
  date.setDate(date.getDate() + 7)
  await page.getByLabel('Date souhaitée').fill(date.toISOString().slice(0, 10))
  await page.getByLabel('Créneau souhaité').selectOption('09:00')
  await page.getByLabel('Je confirme').check()
  await page.getByRole('button', { name: 'Demander un rendez-vous' }).click()
  await expect(page.getByTestId('reference')).toHaveText(/^VIS-\d{4}-[A-Z0-9]{6}$/)
  await page.goto('/#contact')
  await page.getByLabel('Votre nom').fill('Contact-' + stamp)
  await page.getByLabel('Votre email').fill('contact@example.com')
  await page.getByLabel('Votre téléphone').fill('90112233')
  await page.getByLabel('Votre message').fill('Bonjour, je souhaite obtenir des renseignements.')
  await page.getByRole('button', { name: 'Envoyer le message' }).click()
  await expect(page.getByRole('status')).toContainText('Message envoyé')
  await login(page)
  await page.goto('/admin/visites')
  await page.getByLabel('Rechercher').fill('Visiteur-' + stamp)
  await expect(page.getByText('Visiteur-' + stamp, { exact: true })).toBeVisible()
  await page.goto('/admin/messages')
  await page.getByLabel('Rechercher').fill('Contact-' + stamp)
  await expect(page.getByText('Contact-' + stamp, { exact: true })).toBeVisible()
})

test('paramètres persistants et déconnexion protège les routes', async ({ page }) => {
  await login(page)
  await page.goto('/admin/parametres')
  const hours = 'Lundi – Vendredi : 7h00 – 16h00'
  await page.getByLabel('Horaires').fill(hours)
  await page.getByRole('button', { name: 'Enregistrer les paramètres' }).click()
  await expect(page.getByRole('status')).toContainText('Paramètres enregistrés')
  await page.goto('/')
  await expect(page.getByRole('contentinfo').getByText(hours, { exact: true })).toBeVisible()
  await page.goto('/admin')
  await page.getByRole('button', { name: 'Déconnexion' }).click()
  await expect(page).toHaveURL(/admin\/connexion/)
  await page.goto('/admin/preinscriptions')
  await expect(page).toHaveURL(/admin\/connexion/)
})

test('photo téléversée et événement publiés visibles dans les médias', async ({ page }) => {
  await login(page)
  await page.goto('/admin/galerie')
  await page.getByRole('button', { name: 'Ajouter une photo' }).first().click()
  await page.getByLabel(/^Titre/).fill('Photo-' + stamp)
  await page.locator('input[type="file"]').setInputFiles('public/emge-logo.png')
  await expect(page.getByAltText('Aperçu de l’image')).toBeVisible()
  await page.getByLabel('Publié sur le site').check()
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Contenu enregistré')
  // Médias : les photos sans album sont regroupées dans « Autres photos » (la plus récente en premier).
  await page.goto('/medias')
  await expect(page.getByRole('heading', { name: 'Autres photos' })).toBeVisible()
  await expect(page.getByRole('img', { name: 'Photo-' + stamp })).toBeVisible()
  await page.goto('/admin/evenements')
  await page.getByRole('button', { name: 'Créer un événement' }).first().click()
  await page.getByLabel(/^Titre/).fill('Portes ouvertes-' + stamp)
  await page.getByLabel('Date de l’événement').fill('2027-01-20')
  await page.getByLabel('Lieu', { exact: true }).fill('SIFOP - IPAM')
  await page.getByLabel('Publié sur le site').check()
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Contenu enregistré')
  await page.goto('/medias')
  await page.getByRole('button', { name: 'Événements', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Portes ouvertes-' + stamp })).toBeVisible()
})

test('création et désactivation d’un administrateur révoquent son accès', async ({
  page,
  browser,
}) => {
  needsBackend()
  await login(page)
  await page.goto('/admin/utilisateurs')
  await page.getByRole('button', { name: 'Ajouter un utilisateur' }).click()
  const email = `admin-${stamp}@example.com`
  await page.getByLabel('Nom complet').fill('Administrateur Test')
  await page.getByLabel('Adresse email').fill(email)
  await page.getByLabel('Mot de passe', { exact: true }).fill('TestPassword2026!')
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('Utilisateur enregistré')
  const context = await browser.newContext({ baseURL: 'http://127.0.0.1:5174' })
  try {
    const other = await context.newPage()
    await other.goto('/admin/connexion')
    await other.getByLabel('Adresse email').fill(email)
    await other.getByLabel('Mot de passe', { exact: true }).fill('TestPassword2026!')
    await other.getByRole('button', { name: 'Se connecter' }).click()
    await expect(other.getByRole('heading', { name: 'Tableau de bord', exact: true })).toBeVisible()
    await expect(other.getByRole('link', { name: 'Utilisateurs', exact: true })).toHaveCount(0)
    await page
      .getByRole('row')
      .filter({ hasText: email })
      .getByRole('button', { name: 'Modifier' })
      .click()
    await page.getByLabel('Compte actif').uncheck()
    await page.getByRole('button', { name: 'Enregistrer', exact: true }).click()
    await expect(page.getByRole('status')).toContainText('Utilisateur enregistré')
    await other.goto('/admin')
    await expect(other).toHaveURL(/admin\/connexion/)
  } finally {
    await context.close()
  }
})

test('panne réseau affichée sans fausse confirmation de contact', async ({ page }) => {
  needsBackend()
  await page.goto('/#contact')
  await page.getByLabel('Votre nom').fill('Test panne réseau')
  await page.getByLabel('Votre email').fill('panne@example.com')
  await page.getByLabel('Votre téléphone').fill('90112233')
  await page.getByLabel('Votre message').fill('Ce message ne doit pas être enregistré.')
  await page.route('**/api/public/requests/messages', (route) => route.abort('failed'))
  await page.getByRole('button', { name: 'Envoyer le message' }).click()
  await expect(page.getByRole('alert')).toContainText('Le serveur est injoignable')
  await expect(page.getByRole('status')).toHaveCount(0)
  await expect(page.getByLabel('Votre message')).toHaveValue(
    'Ce message ne doit pas être enregistré.',
  )
})

test('administration utilisable sur téléphone et menu refermé après navigation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await login(page)
  await expect(page.locator('.admin-sidebar')).not.toBeInViewport()
  for (const item of [
    { link: 'Actualités', title: 'Actualités' },
    { link: 'Préinscriptions', title: 'Préinscriptions' },
    { link: 'Paramètres', title: 'Paramètres de l’établissement' },
  ]) {
    await page.getByRole('button', { name: 'Ouvrir le menu administrateur' }).click()
    await page.getByRole('link', { name: item.link, exact: true }).click()
    await expect(page.getByRole('heading', { name: item.title, exact: true })).toBeVisible()
    await expect(page.locator('.admin-sidebar')).not.toBeInViewport()
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBeTruthy()
  }
})
