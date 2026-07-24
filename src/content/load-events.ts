import { load } from 'js-yaml'
import { eventFileSchema } from '../game/schemas'
import type { CareerEvent } from '../game/types'

const modules = import.meta.glob('./events/**/*.yaml', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

export function loadEvents(): CareerEvent[] {
  const events = Object.entries(modules).flatMap(([path, source]) => {
    const parsed = eventFileSchema.safeParse(load(source))
    if (!parsed.success) {
      throw new Error(`Contenido narrativo inválido en ${path}: ${parsed.error.message}`)
    }
    return parsed.data.events
  })

  const ids = new Set(events.map((event) => event.id))
  if (events.length !== 500 || ids.size !== 500) {
    throw new Error(`Se esperaban 500 eventos únicos y se encontraron ${events.length} (${ids.size} ids únicos).`)
  }
  return events
}

export const CAREER_EVENTS = loadEvents()
