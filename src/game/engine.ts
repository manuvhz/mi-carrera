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

export const CAREER_STAGE_INFO: Record<CareerStage, { label: string; short: string; milestone: string }> = {
  childhood: { label: 'Fútbol base', short: 'BASE', milestone: 'El siguiente salto es la formación juvenil' },
  academy: { label: 'Juveniles', short: 'JUV', milestone: 'Tu debut profesional llega a los 16' },
  debut: { label: 'Primer equipo', short: 'PRO', milestone: 'Estás ganando minutos como profesional' },
  consolidation: { label: 'Consolidación', short: 'TIT', milestone: 'Cada temporada define tu lugar en el once' },
  prime: { label: 'Mejor momento', short: 'PRIME', milestone: 'Es la etapa para pelear títulos' },
  veteran: { label: 'Veterano', short: 'VET', milestone: 'Tu experiencia ya pesa en el vestuario' },
  'final-years': { label: 'Últimos años', short: 'LEG', milestone: 'Cada partido construye tu legado' },
  retirement: { label: 'Retiro', short: 'FIN', milestone: 'La carrera terminó; queda tu historia' },
}

export function clampStat(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)))
}

export function progressAttribute(current: number, delta: number): number {
  if (delta === 0) return clampStat(current)
  if (delta < 0) {
    const pressure = current >= 90 ? 1.6 : current >= 80 ? 1.3 : 1
    return clampStat(current + Math.round(delta * pressure))
  }
  const efficiency = current >= 95 ? .2 : current >= 88 ? .35 : current >= 78 ? .55 : current >= 65 ? .75 : 1
  return clampStat(current + Math.max(1, Math.round(delta * efficiency)))
}

export function applyChoice(player: CareerPlayer, choice: EventChoice): CareerPlayer {
  const stats: PlayerStats = { ...player.stats }
  for (const effect of choice.effects) {
    const current = stats[effect.path]
    const next = effect.operation === 'set' ? effect.value : effect.operation === 'multiply' ? current * effect.value : current + effect.value
    const countingStat = ['goals', 'assists', 'matches', 'trophies', 'finances'].includes(effect.path)
    stats[effect.path] = countingStat ? Math.max(0, Math.round(next)) : effect.operation === 'add' ? progressAttribute(current, effect.value) : clampStat(next)
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

export interface SeasonSimulation {
  player: CareerPlayer
  matches: number
  goals: number
  assists: number
  position: number
  champion: boolean
}

export function simulateSeason(player: CareerPlayer, seed: number, leagueSize = 8, clubPrestige = 75): SeasonSimulation {
  const random = seededRandom(seed + player.age * 3571 + player.season * 1009)
  const professional = player.age >= 16
  const matchBase = professional ? 27 : 13
  const matchRange = professional ? 10 : 7
  const availability = .86 + player.stats.fitness / 700 + player.stats.resilience / 1000
  const matches = Math.min(professional ? 38 : 20, Math.max(professional ? 24 : 12, Math.round((matchBase + random() * matchRange) * availability)))
  const goalRate = positionRate(player.primaryPosition, 'goals')
  const assistRate = positionRate(player.primaryPosition, 'assists')
  const finishing = player.stats.technique * .46 + player.stats.confidence * .32 + player.stats.talent * .22
  const creation = player.stats.talent * .45 + player.stats.technique * .3 + player.stats.discipline * .25
  const youthFactor = professional ? 1 : .72
  const goals = Math.max(0, Math.round(matches * goalRate * (.42 + finishing / 100) * youthFactor * (.82 + random() * .36)))
  const assists = Math.max(0, Math.round(matches * assistRate * (.45 + creation / 100) * youthFactor * (.82 + random() * .36)))
  const contributionRate = (goals + assists) / Math.max(1, matches)
  const sportingLevel = (player.stats.talent + player.stats.technique + player.stats.fitness + player.stats.discipline + player.stats.confidence) / 5
  const performance = sportingLevel * .58 + contributionRate * 25 + clubPrestige * .22 + random() * 24
  const calculatedPosition = Math.max(1, Math.min(leagueSize, Math.ceil((1 - Math.min(.97, performance / 108)) * leagueSize)))
  const titleChance = Math.min(.55, .015 + Math.max(0, clubPrestige - 72) / 180 + Math.max(0, sportingLevel - 62) / 180 + Math.min(.12, contributionRate * .12))
  const champion = calculatedPosition === 1 || random() < titleChance
  const position = champion ? 1 : Math.max(2, calculatedPosition)
  const stats: PlayerStats = {
    ...player.stats,
    matches: player.stats.matches + matches,
    goals: player.stats.goals + goals,
    assists: player.stats.assists + assists,
    trophies: player.stats.trophies + (champion ? 1 : 0),
    talent: seasonRegression(player.stats.talent),
    technique: seasonRegression(player.stats.technique),
    confidence: seasonRegression(player.stats.confidence),
    fitness: clampStat(seasonRegression(player.stats.fitness) - Math.round(random() * 3) + 1),
    reputation: clampStat(player.stats.reputation + Math.max(1, Math.round((goals + assists) / 3)) + (champion ? 5 : position <= 3 ? 2 : 0)),
  }
  return { player: {
    ...player,
    stats,
  }, matches, goals, assists, position, champion }
}

export function simulateSeasonStats(player: CareerPlayer, seed: number): CareerPlayer {
  return simulateSeason(player, seed).player
}

function positionRate(position: string, kind: 'goals' | 'assists') {
  const rates: Record<string, [number, number]> = {
    Portero: [.004, .012], Defensa: [.045, .075], Mediocampista: [.16, .24], Mediapunta: [.27, .3], Extremo: [.3, .25], Delantero: [.46, .15],
  }
  return (rates[position] ?? rates.Mediocampista)[kind === 'goals' ? 0 : 1]
}

function seasonRegression(value: number) {
  if (value >= 98) return value - 3
  if (value >= 93) return value - 2
  if (value >= 88) return value - 1
  return value
}
