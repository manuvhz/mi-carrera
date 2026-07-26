import { createCareerRival, hasCareerItem, playerForm, playerOverall } from './career-systems'
import type { CareerEvent, CareerPlayer, CareerRival, CareerStage, CompetitionResult, EventChoice, InternationalCareer, PlayerStats } from './types'

export function seededRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let value = Math.imul(state ^ (state >>> 15), 1 | state)
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

export function stageForAge(age: number, retirementAge = 38): CareerStage {
  if (age <= 12) return 'childhood'
  if (age <= 15) return 'academy'
  if (age <= 18) return 'debut'
  if (age <= 22) return 'consolidation'
  if (age <= 27) return 'prime'
  if (age <= 31) return 'veteran'
  if (age < retirementAge) return 'final-years'
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
  overall: number
  form: number
  earnings: number
  competitions: CompetitionResult[]
  individualAwards: string[]
  rival: CareerRival
  rivalSeason: { matches: number; goals: number; assists: number; trophies: number }
}

export function simulateSeason(player: CareerPlayer, seed: number, leagueSize = 8, clubPrestige = 75, leagueId = 'argentina'): SeasonSimulation {
  const random = seededRandom(seed + player.age * 3571 + player.season * 1009)
  const professional = player.age >= 16
  const matchBase = professional ? 27 : 13
  const matchRange = professional ? 10 : 7
  const formBefore = playerForm(player)
  const staffAvailability = hasCareerItem(player, 'premium-chef') ? .025 : 0
  const physioAvailability = hasCareerItem(player, 'personal-physio') ? .025 : 0
  const availability = .84 + player.stats.fitness / 700 + player.stats.resilience / 1000 + staffAvailability + physioAvailability
  const matches = Math.min(professional ? 38 : 20, Math.max(professional ? 24 : 12, Math.round((matchBase + random() * matchRange) * availability)))
  const goalRate = positionRate(player.primaryPosition, 'goals')
  const assistRate = positionRate(player.primaryPosition, 'assists')
  const finishing = player.stats.technique * .46 + player.stats.confidence * .32 + player.stats.talent * .22
  const creation = player.stats.talent * .45 + player.stats.technique * .3 + player.stats.discipline * .25
  const youthFactor = professional ? 1 : .72
  const formFactor = .78 + formBefore / 220
  const goals = Math.max(0, Math.round(matches * goalRate * (.42 + finishing / 100) * youthFactor * formFactor * (.82 + random() * .36)))
  const assists = Math.max(0, Math.round(matches * assistRate * (.45 + creation / 100) * youthFactor * formFactor * (.82 + random() * .36)))
  const contributionRate = (goals + assists) / Math.max(1, matches)
  const overall = playerOverall(player)
  const sportingLevel = overall * .82 + player.stats.discipline * .18
  const performance = sportingLevel * .58 + contributionRate * 25 + clubPrestige * .22 + formBefore * .08 + random() * 18
  const calculatedPosition = Math.max(1, Math.min(leagueSize, Math.ceil((1 - Math.min(.97, performance / 108)) * leagueSize)))
  const titleChance = Math.min(.55, .015 + Math.max(0, clubPrestige - 72) / 180 + Math.max(0, sportingLevel - 62) / 180 + Math.min(.12, contributionRate * .12))
  const champion = calculatedPosition === 1 || random() < titleChance
  const position = champion ? 1 : Math.max(2, calculatedPosition)
  const trainingCount = player.activeFlags.filter((flag) => flag.endsWith(`:season:${player.season}`) && (flag.startsWith('training:') || flag.startsWith('minigame:'))).length
  const psychologistFloor = hasCareerItem(player, 'sports-psychologist') ? 54 : 18
  const form = clampStat(Math.max(psychologistFloor, 38 + contributionRate * 52 + player.stats.confidence * .22 + trainingCount * 3 + random() * 17 - (position > leagueSize * .7 ? 7 : 0)))
  const competitions = simulateCompetitions({ player, professional, champion, position, leagueId, clubPrestige, sportingLevel, form, goals, assists, random })
  const international = simulateInternationalCareer(player, overall, form, random)
  if (international.competition) competitions.push(international.competition)
  const individualAwards = competitions.filter((item) => item.kind === 'individual' && item.won).map((item) => item.name)
  const wonTeamTitles = competitions.filter((item) => item.won && item.kind !== 'individual')
  const baseEarnings = professional
    ? Math.round((clubPrestige * .72 + overall * .55 + player.stats.reputation * .3) * 28)
    : 8 + Math.max(0, player.age - 9) * 6 + player.stats.reputation * 2
  const contractMultiplier = hasCareerItem(player, 'super-agent') ? 1.18 : 1
  const prizeMoney = wonTeamTitles.reduce((sum, competition) => sum + (competition.kind === 'continental' ? 3000 : competition.kind === 'league' ? 1800 : competition.kind === 'international' ? 1200 : 700), 0)
  const earnings = Math.max(0, Math.round(baseEarnings * contractMultiplier + prizeMoney))
  const fitnessWear = hasCareerItem(player, 'fitness-coach') ? 0 : Math.round(random() * 3)
  const resilienceWear = hasCareerItem(player, 'personal-physio') ? 0 : player.age >= 31 ? 1 : 0
  const stats: PlayerStats = {
    ...player.stats,
    matches: player.stats.matches + matches,
    goals: player.stats.goals + goals,
    assists: player.stats.assists + assists,
    trophies: player.stats.trophies + wonTeamTitles.length,
    finances: player.stats.finances + earnings,
    form,
    talent: seasonRegression(player.stats.talent),
    technique: seasonRegression(player.stats.technique),
    confidence: seasonRegression(player.stats.confidence),
    fitness: clampStat(seasonRegression(player.stats.fitness) - fitnessWear + 1),
    resilience: clampStat(seasonRegression(player.stats.resilience) - resilienceWear),
    reputation: clampStat(player.stats.reputation + Math.max(1, Math.round((goals + assists) / 3)) + wonTeamTitles.length * 4 + individualAwards.length * 8 + (position <= 3 ? 2 : 0)),
  }
  const rivalSimulation = simulateRival(player, seed, matches, professional)
  return { player: {
    ...player,
    stats,
    careerEarnings: (player.careerEarnings ?? 0) + earnings,
    nationalTeam: international.career,
  }, matches, goals, assists, position, champion, overall: playerOverall(stats), form, earnings, competitions, individualAwards, rival: rivalSimulation.rival, rivalSeason: rivalSimulation.season }
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

function simulateCompetitions({ player, professional, champion, position, leagueId, clubPrestige, sportingLevel, form, goals, assists, random }: {
  player: CareerPlayer; professional: boolean; champion: boolean; position: number; leagueId: string; clubPrestige: number
  sportingLevel: number; form: number; goals: number; assists: number; random: () => number
}) {
  const results: CompetitionResult[] = []
  const leagueName = professional ? 'Liga nacional' : 'Liga Juvenil Regional'
  results.push({ id: 'league', name: leagueName, result: champion ? 'Campeón' : `Puesto #${position}`, won: champion, kind: 'league' })
  if (!professional) return results

  const cupName = domesticCupName(leagueId)
  const cupScore = sportingLevel * .42 + clubPrestige * .38 + form * .15 + random() * 19
  const cupResult = knockoutResult(cupScore)
  results.push({ id: 'domestic-cup', name: cupName, result: cupResult, won: cupResult === 'Campeón', kind: 'cup' })

  const previousPosition = player.seasonHistory?.at(-1)?.leaguePosition ?? 99
  const continentalQualified = player.age >= 18 && (clubPrestige >= 78 || previousPosition <= 4)
  if (continentalQualified) {
    const southAmerica = leagueId === 'argentina' || leagueId === 'brazil'
    const eliteTournament = clubPrestige >= 82 || previousPosition <= 3
    const continentalName = southAmerica
      ? eliteTournament ? 'Copa Libertadores' : 'Copa Sudamericana'
      : eliteTournament ? 'UEFA Champions League' : 'UEFA Europa League'
    const continentalScore = sportingLevel * .4 + clubPrestige * .4 + form * .12 + random() * 20 - (eliteTournament ? 4 : 0)
    const continentalResult = knockoutResult(continentalScore)
    results.push({ id: 'continental', name: continentalName, result: continentalResult, won: continentalResult === 'Campeón', kind: 'continental' })
  }

  const ballonCandidate = player.age >= 20 && playerOverall(player) >= 84 && form >= 72 && goals + assists >= 18
  if (ballonCandidate) {
    const winner = playerOverall(player) + form * .15 + (goals + assists) * .7 + random() * 18 >= 119
    results.push({ id: 'ballon-dor', name: 'Balón de Oro', result: winner ? 'Ganador' : 'Nominado', won: winner, kind: 'individual' })
  }
  return results
}

function domesticCupName(leagueId: string) {
  const names: Record<string, string> = {
    argentina: 'Copa Argentina', brazil: 'Copa do Brasil', england: 'FA Cup', spain: 'Copa del Rey', italy: 'Coppa Italia', germany: 'DFB-Pokal', france: 'Coupe de France',
  }
  return names[leagueId] ?? 'Copa nacional'
}

function knockoutResult(score: number) {
  if (score >= 91) return 'Campeón'
  if (score >= 83) return 'Finalista'
  if (score >= 74) return 'Semifinales'
  if (score >= 64) return 'Cuartos de final'
  return 'Eliminado temprano'
}

function simulateRival(player: CareerPlayer, seed: number, playerMatches: number, professional: boolean) {
  const base = player.rival ?? createCareerRival(seed + 91, player.age)
  const random = seededRandom(seed + player.season * 613 + 41)
  const matches = Math.max(professional ? 22 : 10, Math.round(playerMatches * (.88 + random() * .18)))
  const rivalLevel = Math.min(96, 47 + Math.max(0, player.age - 10) * 2.1 + base.reputation * .22)
  const goals = Math.max(0, Math.round(matches * .28 * (.55 + rivalLevel / 100) * (.8 + random() * .45)))
  const assists = Math.max(0, Math.round(matches * .16 * (.55 + rivalLevel / 100) * (.8 + random() * .45)))
  const trophies = professional && random() < Math.min(.28, .04 + rivalLevel / 520) ? 1 : 0
  const internationalCaps = professional && base.reputation >= 38 ? Math.round(2 + random() * 7) : 0
  return {
    rival: {
      ...base,
      matches: base.matches + matches,
      goals: base.goals + goals,
      assists: base.assists + assists,
      trophies: base.trophies + trophies,
      reputation: clampStat(base.reputation + Math.max(1, Math.round((goals + assists) / 4)) + trophies * 4),
      nationalTeamCaps: (base.nationalTeamCaps ?? 0) + internationalCaps,
    },
    season: { matches, goals, assists, trophies },
  }
}

function simulateInternationalCareer(player: CareerPlayer, overall: number, form: number, random: () => number): { career: InternationalCareer; competition: CompetitionResult | null } {
  const previous = player.nationalTeam ?? { calledUp: false, caps: 0, goals: 0, trophies: 0 }
  const eligible = player.age >= 18 && overall >= 70 && player.stats.reputation >= 38
  if (!eligible) return { career: previous, competition: null }
  const caps = Math.max(2, Math.round(3 + random() * 7 + (form >= 75 ? 2 : 0)))
  const goalRate = positionRate(player.primaryPosition, 'goals') * .7
  const goals = Math.max(0, Math.round(caps * goalRate * (.6 + overall / 100) * (.8 + random() * .4)))
  const tournamentYear = player.season % 4 === 0
  const wonTournament = tournamentYear && overall + form * .14 + player.stats.reputation * .12 + random() * 20 >= 107
  const career = { calledUp: true, caps: previous.caps + caps, goals: previous.goals + goals, trophies: previous.trophies + (wonTournament ? 1 : 0) }
  const competition: CompetitionResult = {
    id: 'national-team',
    name: `Selección de ${player.nationality}`,
    result: wonTournament ? 'Campeón internacional' : tournamentYear ? `${caps} partidos · torneo disputado` : `${caps} partidos · ${goals} goles`,
    won: wonTournament,
    kind: 'international',
  }
  return { career, competition }
}
