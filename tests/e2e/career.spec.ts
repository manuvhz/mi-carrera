import { expect, test } from '@playwright/test'

test('crea un futbolista y resuelve su primer evento', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Comenzar mi historia/ }).click()
  await page.getByLabel('Nombre').fill('Lina')
  await page.getByLabel('Apellido').fill('Rojas')
  await page.getByRole('button', { name: /Construir mi origen/ }).click()
  await expect(page.getByText(/Antes del estadio estaba/)).toBeVisible()
  await page.getByRole('button', { name: /Empezar la carrera/ }).click()
  await page.getByRole('button', { name: /Descubrir acontecimiento/ }).click()
  await page.locator('.choices button').first().click()
  await expect(page.getByText('La historia recuerda tu decisión.')).toBeVisible()
})

test('elige un club real y completa un entrenamiento interactivo', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Comenzar mi historia/ }).click()
  await page.getByLabel('Nombre').fill('Manu')
  await page.getByLabel('Apellido').fill('Vargas')
  await page.getByRole('radio', { name: /Gimnasia de Jujuy/ }).click()
  await page.getByRole('button', { name: /Construir mi origen/ }).click()
  await expect(page.getByText('Gimnasia y Esgrima de Jujuy')).toBeVisible()
  await page.getByRole('button', { name: /Empezar la carrera/ }).click()
  await expect(page.getByRole('img', { name: /Escudo de Gimnasia y Esgrima de Jujuy/ })).toBeVisible()
  await page.getByRole('button', { name: /Duelo de penales/ }).click()
  await page.getByRole('button', { name: 'Arriba izquierda' }).click()
  await page.getByRole('button', { name: 'Arriba centro' }).click()
  await page.getByRole('button', { name: 'Arriba derecha' }).click()
  await expect(page.getByText('ENTRENAMIENTO COMPLETADO')).toBeVisible()
  await expect(page.getByText(/La mejora ya fue guardada/)).toBeVisible()
})

test('cierra el año con un anuario y comienza la temporada siguiente', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /Comenzar mi historia/ }).click()
  await page.getByLabel('Nombre').fill('Mara')
  await page.getByLabel('Apellido').fill('Ledesma')
  await page.getByRole('button', { name: /Construir mi origen/ }).click()
  await page.getByRole('button', { name: /Empezar la carrera/ }).click()

  for (let decision = 0; decision < 2; decision += 1) {
    await page.getByRole('button', { name: /Descubrir acontecimiento/ }).click()
    await page.locator('.choices button').first().click()
    await page.getByRole('button', { name: /Continuar/ }).click()
  }

  await page.getByRole('button', { name: /Cerrar el año/ }).click()
  await expect(page.getByText('RESUMEN DE TEMPORADA')).toBeVisible()
  await expect(page.getByText('CLASIFICACIÓN FICTICIA DE ESTA PARTIDA')).toBeVisible()
  await expect(page.getByText(/Lo que dejó la temporada/)).toBeVisible()
  await page.getByRole('button', { name: /Comenzar la próxima temporada/ }).click()
  await expect(page.getByText(/TEMPORADA 2/).first()).toBeVisible()
})
