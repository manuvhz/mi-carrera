import { expect, test } from '@playwright/test'

test('crea un futbolista y resuelve su primer evento', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Comenzar mi historia/ }).click()
  await page.getByLabel('Nombre').fill('Lina')
  await page.getByLabel('Apellido').fill('Rojas')
  await page.getByRole('button', { name: /Construir mi origen/ }).click()
  await expect(page.getByText(/Antes del estadio estaba/)).toBeVisible()
  await page.getByRole('button', { name: /Empezar la carrera/ }).click()
  await expect(page.locator('.decision-scene')).toBeVisible()
  await expect(page.getByRole('button', { name: /Descubrir acontecimiento|Cerrar el año/ })).toHaveCount(0)

  const eventTitle = await page.locator('.decision-scene h2').innerText()
  const choiceLabels = await page.locator('.decision-choice > strong').allInnerTexts()
  expect(choiceLabels.length).toBeGreaterThan(1)
  for (const choiceLabel of choiceLabels) {
    expect(choiceLabel).not.toContain(eventTitle)
    expect(choiceLabel.length).toBeLessThan(100)
  }

  await page.locator('.decision-choice').first().click()
  await expect(page.getByText('DECISIÓN TOMADA')).toBeVisible()
  await expect(page.getByText('LO QUE CAMBIÓ')).toBeVisible()
})

test('elige un club real y combina una rutina con un reto interactivo', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Comenzar mi historia/ }).click()
  await page.getByLabel('Nombre').fill('Manu')
  await page.getByLabel('Apellido').fill('Vargas')
  await page.getByRole('radio', { name: /Gimnasia de Jujuy/ }).click()
  await page.getByRole('button', { name: /Construir mi origen/ }).click()
  await expect(page.getByText('Gimnasia y Esgrima de Jujuy')).toBeVisible()
  await page.getByRole('button', { name: /Empezar la carrera/ }).click()
  await expect(page.getByRole('img', { name: /Escudo de Gimnasia y Esgrima de Jujuy/ })).toBeVisible()
  await page.getByRole('button', { name: /Trabajo de fuerza/ }).click()
  await expect(page.getByText(/Sesión completada/)).toBeVisible()
  await page.getByRole('button', { name: /Duelo de penales/ }).click()
  await page.getByRole('button', { name: 'Arriba izquierda' }).click()
  await page.getByRole('button', { name: 'Arriba centro' }).click()
  await page.getByRole('button', { name: 'Arriba derecha' }).click()
  await expect(page.getByText('TRABAJO COMPLETADO')).toBeVisible()
  await expect(page.getByText(/La mejora ya fue guardada/)).toBeVisible()
})

test('puede empezar su carrera en una de las cinco grandes ligas', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Comenzar mi historia/ }).click()
  await page.getByLabel('Nombre').fill('Alex')
  await page.getByLabel('Apellido').fill('Martín')
  await page.getByRole('tab', { name: /España/ }).click()
  await page.getByRole('radio', { name: /Barcelona/ }).click()
  await page.getByRole('button', { name: /Construir mi origen/ }).click()
  await expect(page.getByText('FC Barcelona')).toBeVisible()
  await expect(page.getByText(/Barcelona · LALIGA/)).toBeVisible()
  await page.getByRole('button', { name: /Empezar la carrera/ }).click()
  await expect(page.getByRole('img', { name: /Escudo de FC Barcelona/ })).toBeVisible()
  await expect(page.locator('.hud-season small')).toHaveText('LALIGA')
})

test('puede empezar en Brasil con un escudo real', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Comenzar mi historia/ }).click()
  await page.getByLabel('Nombre').fill('João')
  await page.getByLabel('Apellido').fill('Silva')
  await page.getByRole('tab', { name: /Brasil/ }).click()
  await page.getByRole('radio', { name: /Flamengo/ }).click()
  await page.getByRole('button', { name: /Construir mi origen/ }).click()
  await expect(page.getByText('Clube de Regatas do Flamengo')).toBeVisible()
  await expect(page.getByText(/Río de Janeiro · Brasileirão Série A/)).toBeVisible()
  await page.getByRole('button', { name: /Empezar la carrera/ }).click()
  await expect(page.getByRole('img', { name: /Escudo de Clube de Regatas do Flamengo/ })).toBeVisible()
  await expect(page.locator('.hud-season small')).toHaveText('Brasileirão Série A')
})

test('avanza solo al anuario tras tres acontecimientos y comienza la temporada siguiente', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Comenzar mi historia/ }).click()
  await page.getByLabel('Nombre').fill('Mara')
  await page.getByLabel('Apellido').fill('Ledesma')
  await page.getByRole('button', { name: /Construir mi origen/ }).click()
  await page.getByRole('button', { name: /Empezar la carrera/ }).click()

  for (let decision = 0; decision < 3; decision += 1) {
    await expect(page.locator('.decision-scene')).toBeVisible()
    await page.locator('.decision-choice').first().click()
    await page.getByRole('button', { name: /Seguir la historia/ }).click()
  }

  await expect(page.getByText('RESUMEN DE TEMPORADA')).toBeVisible()
  await expect(page.getByText('POSICIÓN FINAL', { exact: true })).toBeVisible()
  await expect(page.locator('.standing-row')).toHaveCount(0)
  await expect(page.getByText(/Lo que dejó la temporada/)).toBeVisible()
  await page.getByRole('button', { name: /Comenzar la próxima temporada/ }).click()
  await expect(page.locator('.hud-season strong')).toHaveText('02')
  await expect(page.locator('.hud-mission strong')).toContainText('0/3 decisiones')
  await expect(page.locator('.decision-scene')).toBeVisible()
})
