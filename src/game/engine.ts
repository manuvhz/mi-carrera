import type { CareerEvent, CareerPlayer, CareerStage, EventChoice, PlayerStats } from './types'

export function seededRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let value = Math.imul(state ^ (state >>> 15), 1 | state)
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

export function stageForAge(age: number): CareerStage {
  if (age <= 12) return 'childhood'
  if (age <= 15) return 'academy'
  if (age <= 18) return 'debut'
  if (age <= 22) return 'consolidation'
  if (age <= 27) return 'prime'
  if (age <= 31) return 'veteran'
  if (age <= 36) return 'final-years'
  return 'retirement'
}

export function clampStat(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)))
}

export function applyChoice(player: CareerPlayer, choice: EventChoice): CareerPlayer {
  const stats: PlayerStats = { ...player.stats }
  for (const effect of choice.effects) {
    const current = stats[effect.path]
    const next = effect.operation === 'set' ? effect.value : effect.operation === 'multiply' ? current * effect.value : current + effect.value
    const countingStat = ['goals', 'assists', 'matches', 'trophies', 'finances'].includes(effect.path)
    stats[effect.path] = countingStat ? Math.max(0, Math.round(next)) : clampStat(next)
  }
  return { ...player, stats, activeFlags: [...new Set([...player.activeFlags, ...(choice.flagsToAdd ?? [])])] }
}

export function selectEvent(events: CareerEvent[], player: CareerPlayer, seed: number): CareerEvent {
  const seen = new Set(player.eventHistory.map((entry) => entry.eventId))
  let eligible = events.filter((event) =>
    event.stage === player.careerStage && player.age >= event.ageMin && player.age <= event.ageMax && (!event.oncePerCareer || !seen.has(event.id)),
  )
  if (!eligible.length) {
    eligible = events.filter((event) => event.stage === player.careerStage && player.age >= event.ageMin && player.age <= event.ageMax)
  }
  if (!eligible.length) throw new Error(`No hay eventos disponibles para ${player.careerStage} a los ${player.age} años.`)

  const random = seededRandom(seed + player.eventHistory.length * 7919 + player.age * 101)
  const total = eligible.reduce((sum, event) => sum + event.baseWeight, 0)
  let cursor = random() * total
  for (const event of eligible) {
    cursor -= event.baseWeight
    if (cursor <= 0) return event
  }
  return eligible[eligible.length - 1]
}

export function simulateSeasonStats(player: CareerPlayer, seed: number): CareerPlayer {
  const random = seededRandom(seed + player.age * 3571)
  const professional = player.age >= 16
  const matches = professional ? Math.round(12 + random() * 26) : Math.round(5 + random() * 12)
  const attackFactor = ['Delantero', 'Extremo', 'Mediapunta'].includes(player.primaryPosition) ? 0.36 : 0.12
  const goals = Math.round(matches * attackFactor * (0.45 + player.stats.technique / 100) * random())
  const assists = Math.round(matches * 0.24 * (0.5 + player.stats.talent / 100) * random())
  return {
    ...player,
    stats: {
      ...player.stats,
      matches: player.stats.matches + matches,
      goals: player.stats.goals + goals,
      assists: player.stats.assists + assists,
      fitness: clampStat(player.stats.fitness - Math.round(random() * 5) + 2),
      reputation: clampStat(player.stats.reputation + Math.max(1, Math.round((goals + assists) / 4))),
    },
  }
}
