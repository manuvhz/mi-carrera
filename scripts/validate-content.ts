import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import YAML from 'yaml'
import { eventFileSchema } from '../src/game/schemas'

const root = join(process.cwd(), 'src', 'content', 'events')
const stageExpected: Record<string, number> = { childhood: 70, academy: 85, debut: 95, consolidation: 90, prime: 70, veteran: 45, 'final-years': 30, retirement: 15 }
const rarityExpected: Record<string, number> = { common: 260, uncommon: 150, rare: 70, legendary: 20 }

async function yamlFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(entries.map((entry) => entry.isDirectory() ? yamlFiles(join(directory, entry.name)) : [join(directory, entry.name)]))
  return files.flat().filter((file) => file.endsWith('.yaml'))
}

const paths = await yamlFiles(root)
const all = []
for (const path of paths) {
  const parsed = eventFileSchema.safeParse(YAML.parse(await readFile(path, 'utf8')))
  if (!parsed.success) throw new Error(`${path}: ${parsed.error.message}`)
  all.push(...parsed.data.events)
}

const ids = new Set(all.map((event) => event.id))
if (all.length !== 500) throw new Error(`Se esperaban 500 eventos y hay ${all.length}.`)
if (ids.size !== 500) throw new Error(`Hay ${500 - ids.size} identificadores duplicados.`)
for (const [stage, expected] of Object.entries(stageExpected)) {
  const actual = all.filter((event) => event.stage === stage).length
  if (actual !== expected) throw new Error(`${stage}: se esperaban ${expected} y hay ${actual}.`)
}
for (const [rarity, expected] of Object.entries(rarityExpected)) {
  const actual = all.filter((event) => event.rarity === rarity).length
  if (actual !== expected) throw new Error(`${rarity}: se esperaban ${expected} y hay ${actual}.`)
}
const chainEvents = all.filter((event) => event.chainId)
const chains = new Set(chainEvents.map((event) => event.chainId))
if (chainEvents.length !== 120 || chains.size < 20) throw new Error(`Cadenas inválidas: ${chainEvents.length} eventos en ${chains.size} cadenas.`)
const groupExpected: Record<string, number> = { independent: 330, 'narrative-chain': 120, 'special-rare': 35, retirement: 15 }
for (const [group, expected] of Object.entries(groupExpected)) {
  const actual = all.filter((event) => event.tags.includes(group)).length
  if (actual !== expected) throw new Error(`${group}: se esperaban ${expected} y hay ${actual}.`)
}
const assertUnique = (label: string, values: string[]) => {
  const normalized = values.map((value) => value.toLocaleLowerCase('es').replace(/[^a-záéíóúñ0-9]+/g, ' ').trim())
  const unique = new Set(normalized)
  if (unique.size !== normalized.length) throw new Error(`${label}: se detectaron ${normalized.length - unique.size} duplicados o variantes triviales.`)
}
assertUnique('Títulos', all.map((event) => event.title))
assertUnique('Descripciones', all.map((event) => event.description))
assertUnique('Opciones', all.flatMap((event) => event.choices.map((choice) => choice.text)))
console.log(`✓ ${all.length} eventos válidos en ${paths.length} archivos`)
console.log(`✓ Distribución, grupos y rarezas correctos; ${chains.size} cadenas narrativas`)
