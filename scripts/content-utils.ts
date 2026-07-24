import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import YAML from 'yaml'
import { eventFileSchema } from '../src/game/schemas'
import type { CareerEvent } from '../src/game/types'

async function files(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  return (await Promise.all(entries.map((entry) => entry.isDirectory() ? files(join(directory, entry.name)) : [join(directory, entry.name)]))).flat().filter((file) => file.endsWith('.yaml'))
}

export async function readEvents(): Promise<CareerEvent[]> {
  const paths = await files(join(process.cwd(), 'src', 'content', 'events'))
  const batches = await Promise.all(paths.map(async (path) => eventFileSchema.parse(YAML.parse(await readFile(path, 'utf8'))).events))
  return batches.flat()
}
