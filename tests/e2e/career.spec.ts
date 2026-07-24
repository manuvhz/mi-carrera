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
