import { create } from 'zustand'
import { APP_CONFIG } from '../config'
import { CAREER_EVENTS } from '../content/load-events'
import { clubById, clubForPlayer, DEFAULT_CLUB_ID, REAL_CLUBS } from '../content/real-clubs'
import { applyChoice, progressAttribute, selectEvent, simulateSeason, stageForAge } from '../game/engine'
import { createCareerRival, formatCareerMoney, retirementAgeFor } from '../game/career-systems'
import { buildDecisionOutcome, type DecisionOutcome } from '../game/experience'
import { isNarrativeEventId } from '../game/history'
import { shopItemById } from '../game/shop'
import type { CareerEvent, CareerPlayer, EventChoice, SaveGame } from '../game/types'
import { loadCareer, saveCareer } from '../persistence/database'

interface PlayerDraft {
  firstName: string; lastName: string; nickname: string; nationality: string; region: string; gender: string
  age: number; preferredFoot: 'Izquierdo' | 'Derecho' | 'Ambos'; favoriteNumber: number; primaryPosition: string
  favoriteClubId?: string
  geographicOrigin: string; economicBackground: string; footballLegacy: string; firstFootballEnvironment: string; initialPersonality: string
}

interface CareerState {
  seed: number
  player: CareerPlayer | null
  currentEvent: CareerEvent | null
  lastResult: string | null
  lastOutcome: DecisionOutcome | null
  eventsThisYear: number
  saveSlot: number
  createCareer: (draft: PlayerDraft, seed?: number) => void
  drawEvent: () => void
  resolveChoice: (choice: EventChoice) => void
  continueAfterResult: () => void
  advanceYear: (nextClubId?: string) => void
  choosePlaystyle: (styleId: 'finisher' | 'engine' | 'allrounder') => void
  completeTrainingSession: (sessionId: TrainingSessionId, tacticalFocus?: TacticalFocusId) => void
  completeMiniGame: (gameId: 'penalties' | 'reactions' | 'passing', score: number, maximum: number) => void
  purchaseCareerUpgrade: (upgradeId: CareerUpgradeId) => void
  purchaseShopItem: (itemId: string) => void
  save: () => Promise<void>
  load: (slot: number) => Promise<boolean>
  reset: () => void
}

const initialStats = { talent: 48, technique: 42, fitness: 62, discipline: 50, confidence: 48, resilience: 52, reputation: 3, family: 65, community: 55, finances: 12, goals: 0, assists: 0, matches: 0, trophies: 0, form: 55 }

export const useCareerStore = create<CareerState>((set, get) => ({
  seed: 0, player: null, currentEvent: null, lastResult: null, lastOutcome: null, eventsThisYear: 0, saveSlot: 1,
  createCareer: (draft, forcedSeed) => {
    const seed = forcedSeed ?? Math.floor(Math.random() * 2_147_483_647)
    const player: CareerPlayer = {
      ...draft,
      id: crypto.randomUUID(),
      birthYear: new Date().getFullYear() - draft.age,
      careerStage: stageForAge(draft.age), season: 1, currentClubId: null, clubRole: 'Promesa local', activeFlags: [], eventHistory: [],
      narrativeCharacters: [{ id: 'mentor-origin', name: 'Samir Rojas', role: 'Primer entrenador', relationshipValue: 60, activeStatus: true, history: ['Te vio jugar antes que nadie.'] }],
      stats: { ...initialStats },
      careerEarnings: 0,
      ownedItems: [],
      clubIdolatries: {},
      rival: createCareerRival(seed, draft.age),
      seasonHistory: [],
    }
    set({ seed, player, currentEvent: null, lastResult: null, lastOutcome: null, eventsThisYear: 0 })
  },
  drawEvent: () => {
    const { player, seed } = get()
    if (!player) return
    set({ currentEvent: selectEvent(CAREER_EVENTS, player, seed), lastResult: null, lastOutcome: null })
  },
  resolveChoice: (choice) => {
    const { player, currentEvent, eventsThisYear } = get()
    if (!player || !currentEvent) return
    const changed = applyChoice(player, choice)
    const outcome = buildDecisionOutcome(currentEvent, choice, player.stats, changed.stats)
    const next: CareerPlayer = {
      ...changed,
      eventHistory: [...changed.eventHistory, {
        eventId: currentEvent.id, title: currentEvent.title, age: player.age, season: player.season,
        choiceId: choice.id, choiceText: choice.text, result: choice.result, date: new Date().toISOString(),
      }],
    }
    set({ player: next, currentEvent: null, lastResult: choice.result, lastOutcome: outcome, eventsThisYear: eventsThisYear + 1 })
    void get().save()
  },
  continueAfterResult: () => set({ lastResult: null, lastOutcome: null }),
  advanceYear: (nextClubId) => {
    const { player, seed } = get()
    if (!player) return
    const seasonClub = clubForPlayer(player)
    const leagueSize = REAL_CLUBS.filter((club) => club.leagueId === seasonClub.leagueId).length
    const simulation = simulateSeason(player, seed, leagueSize, seasonClub.prestige, seasonClub.leagueId)
    const simulated = simulation.player
    const youthStep = player.age < 16 ? Math.min(APP_CONFIG.youthYearsPerSeason, 16 - player.age) : 1
    const age = simulated.age + youthStep
    const retired = age >= retirementAgeFor(simulated)
    const currentClub = simulated.currentClubId ? clubById(simulated.currentClubId) : null
    const selectedClub = age >= 16 ? clubById(nextClubId ?? currentClub?.id ?? simulated.favoriteClubId ?? DEFAULT_CLUB_ID) : null
    const changedClub = Boolean(selectedClub && selectedClub.id !== currentClub?.id)
    const season = simulated.season + 1
    const clubIdolatries = { ...(simulated.clubIdolatries ?? {}) }
    if (player.currentClubId && player.age >= 16) {
      const titleBoost = simulation.competitions.filter((competition) => competition.won && competition.kind !== 'individual').length * 10
      const gain = Math.max(2, Math.round((simulation.goals + simulation.assists) / 2) + titleBoost + (selectedClub?.id === player.currentClubId ? 3 : 0))
      clubIdolatries[player.currentClubId] = Math.min(100, (clubIdolatries[player.currentClubId] ?? 0) + gain - (changedClub ? 8 : 0))
    }
    if (selectedClub && clubIdolatries[selectedClub.id] === undefined) clubIdolatries[selectedClub.id] = 0
    const rivalClub = rivalClubFor(simulation.rival.currentClubId, selectedClub?.id, selectedClub?.leagueId, seed + season)
    const seasonRecord = {
      season: player.season,
      age: player.age,
      clubId: seasonClub.id,
      leaguePosition: simulation.position,
      matches: simulation.matches,
      goals: simulation.goals,
      assists: simulation.assists,
      overall: simulation.overall,
      form: simulation.form,
      earnings: simulation.earnings,
      titles: simulation.competitions.filter((competition) => competition.won && competition.kind !== 'individual').map((competition) => competition.name),
      competitions: simulation.competitions,
      individualAwards: simulation.individualAwards,
    }
    const transferEntry = changedClub && selectedClub ? {
      eventId: `transfer-${season}-${selectedClub.id}`,
      title: currentClub ? `Un nuevo escudo: ${selectedClub.name}` : `Primer contrato: ${selectedClub.name}`,
      age,
      season,
      choiceId: selectedClub.id,
      choiceText: currentClub ? `Aceptaste la oferta de ${selectedClub.name}` : `Firmaste tu primer contrato con ${selectedClub.name}`,
      result: currentClub ? `Dejas ${currentClub.name} y empiezas una nueva etapa en ${selectedClub.city}, dentro de ${selectedClub.league}.${currentClub.leagueId !== selectedClub.leagueId ? ' El salto al exterior cambia la escala de tu carrera.' : ''}` : `La cantera te abre la puerta del primer equipo en ${selectedClub.league}.`,
      date: new Date().toISOString(),
    } : null
    const next = {
      ...simulated,
      age,
      season,
      careerStage: retired ? 'retirement' as const : stageForAge(age, retirementAgeFor(simulated)),
      currentClubId: selectedClub?.id ?? null,
      clubRole: roleForAge(age, selectedClub?.prestige ?? 0, retired),
      clubIdolatries,
      rival: { ...simulation.rival, age, currentClubId: rivalClub?.id ?? simulation.rival.currentClubId },
      seasonHistory: [...(simulated.seasonHistory ?? []), seasonRecord],
      activeFlags: changedClub && selectedClub ? [...simulated.activeFlags, `club:${selectedClub.id}:season:${season}`] : simulated.activeFlags,
      eventHistory: transferEntry ? [...simulated.eventHistory, transferEntry] : simulated.eventHistory,
    }
    set({ player: next, eventsThisYear: 0, currentEvent: null, lastResult: null, lastOutcome: null })
    void get().save()
  },
  choosePlaystyle: (styleId) => {
    const { player } = get()
    if (!player || player.activeFlags.some((flag) => flag.startsWith('playstyle:'))) return
    const rewards = {
      finisher: { technique: 8, confidence: 3, label: 'Finalizador' },
      engine: { fitness: 8, discipline: 3, label: 'Motor del equipo' },
      allrounder: { talent: 3, technique: 3, fitness: 3, discipline: 3, label: 'Todoterreno' },
    } as const
    const reward = rewards[styleId]
    const stats = { ...player.stats }
    for (const [key, value] of Object.entries(reward)) {
      if (key === 'label') continue
      const stat = key as keyof typeof stats
      stats[stat] = progressAttribute(stats[stat], Number(value))
    }
    const next = { ...player, stats, activeFlags: [...player.activeFlags, `playstyle:${styleId}`] }
    set({ player: next, lastResult: `Elegiste el estilo ${reward.label}. Esos hábitos ya empiezan a definir tu carrera.`, lastOutcome: null })
    void get().save()
  },
  completeTrainingSession: (sessionId, tacticalFocus) => {
    const { player } = get()
    if (!player) return
    const flag = `training:${sessionId}:season:${player.season}`
    if (player.activeFlags.includes(flag)) return
    const sessions = {
      strength: { title: 'Trabajo de velocidad', choice: 'Completaste una sesión de potencia y aceleración', rewards: { fitness: 3, discipline: 1 } },
      recovery: { title: 'Recuperación activa', choice: 'Priorizaste la recuperación y el cuidado físico', rewards: { resilience: 3, confidence: 1 } },
      tactics: tacticalTraining(tacticalFocus ?? 'possession'),
    } as const
    const session = sessions[sessionId]
    const stats = { ...player.stats }
    for (const [key, value] of Object.entries(session.rewards)) {
      const stat = key as keyof typeof stats
      stats[stat] = progressAttribute(stats[stat], value)
    }
    const rewardText = Object.entries(session.rewards).map(([key, value]) => `+${value} ${TRAINING_STAT_LABELS[key as keyof typeof TRAINING_STAT_LABELS]}`).join(' · ')
    const result = `${session.title} completado. ${rewardText}.`
    const next: CareerPlayer = {
      ...player,
      stats,
      activeFlags: [...player.activeFlags, flag],
      eventHistory: [...player.eventHistory, {
        eventId: `training-${sessionId}`, title: session.title, age: player.age, season: player.season,
        choiceId: tacticalFocus ?? sessionId, choiceText: session.choice, result, date: new Date().toISOString(),
      }],
    }
    set({ player: next })
    void get().save()
  },
  completeMiniGame: (gameId, score, maximum) => {
    const { player } = get()
    if (!player || maximum <= 0) return
    const flag = `minigame:${gameId}:season:${player.season}`
    if (player.activeFlags.includes(flag)) return
    const level = Math.max(1, Math.min(5, Math.round((score / maximum) * 5)))
    const stats = { ...player.stats }
    const gameRewards = {
      penalties: ['technique', 'confidence'],
      reactions: ['fitness', 'resilience'],
      passing: ['talent', 'discipline'],
    } as const
    for (const stat of gameRewards[gameId]) stats[stat] = progressAttribute(stats[stat], level)
    const titles = { penalties: 'Duelo de penales', reactions: 'Reflejos bajo presión', passing: 'Visión de pase' }
    const result = `${titles[gameId]}: lograste ${score} de ${maximum}. Tus atributos subieron +${level}.`
    const next: CareerPlayer = {
      ...player,
      stats,
      activeFlags: [...player.activeFlags, flag],
      eventHistory: [...player.eventHistory, {
        eventId: `training-${gameId}`, title: titles[gameId], age: player.age, season: player.season,
        choiceId: `score-${score}`, choiceText: `Entrenamiento: ${score}/${maximum}`, result, date: new Date().toISOString(),
      }],
    }
    set({ player: next })
    void get().save()
  },
  purchaseCareerUpgrade: (upgradeId) => {
    const { player } = get()
    if (!player) return
    const alreadyInvested = player.activeFlags.some((flag) => flag.startsWith('investment:') && flag.endsWith(`:season:${player.season}`))
    const upgrade = CAREER_UPGRADES[upgradeId]
    if (alreadyInvested || player.stats.finances < upgrade.cost) return
    const stats: CareerPlayer['stats'] = { ...player.stats, finances: player.stats.finances - upgrade.cost }
    for (const [key, value] of Object.entries(upgrade.rewards)) {
      const stat = key as keyof CareerPlayer['stats']
      stats[stat] = progressAttribute(stats[stat], value)
    }
    const result = `${upgrade.title}: invertiste ${formatCareerMoney(upgrade.cost)}. ${upgrade.result}`
    const next: CareerPlayer = {
      ...player,
      stats,
      activeFlags: [...player.activeFlags, `investment:${upgradeId}:season:${player.season}`],
      eventHistory: [...player.eventHistory, {
        eventId: `training-investment-${upgradeId}`, title: upgrade.title, age: player.age, season: player.season,
        choiceId: upgradeId, choiceText: `Invertiste en ${upgrade.title.toLowerCase()}`, result, date: new Date().toISOString(),
      }],
    }
    set({ player: next })
    void get().save()
  },
  purchaseShopItem: (itemId) => {
    const { player } = get()
    const item = shopItemById(itemId)
    if (!player || !item || player.ownedItems?.includes(item.id) || player.stats.finances < item.cost) return
    const stats: CareerPlayer['stats'] = { ...player.stats, finances: player.stats.finances - item.cost }
    for (const [key, value] of Object.entries(item.rewards ?? {})) {
      const stat = key as keyof CareerPlayer['stats']
      stats[stat] = progressAttribute(stats[stat] ?? 0, value)
    }
    const clubIdolatries = { ...(player.clubIdolatries ?? {}) }
    if (player.currentClubId && (item.category === 'legacy' || item.id === 'mansion')) {
      clubIdolatries[player.currentClubId] = Math.min(100, (clubIdolatries[player.currentClubId] ?? 0) + (item.category === 'legacy' ? 8 : 2))
    }
    const result = `${item.title}: pagaste ${formatCareerMoney(item.cost)}. ${item.perk}.`
    const next: CareerPlayer = {
      ...player,
      stats,
      clubIdolatries,
      ownedItems: [...(player.ownedItems ?? []), item.id],
      eventHistory: [...player.eventHistory, {
        eventId: `shop-${item.id}`, title: item.title, age: player.age, season: player.season,
        choiceId: item.id, choiceText: `Compraste ${item.title.toLowerCase()}`, result, date: new Date().toISOString(),
      }],
    }
    set({ player: next })
    void get().save()
  },
  save: async () => {
    const { player, seed, saveSlot } = get()
    if (!player) return
    await saveCareer(saveSlot, { version: APP_CONFIG.saveVersion, seed, player, updatedAt: new Date().toISOString() })
  },
  load: async (slot) => {
    const save = await loadCareer(slot)
    if (!save) return false
    const player: CareerPlayer = {
      ...save.player,
      careerEarnings: save.player.careerEarnings ?? 0,
      ownedItems: save.player.ownedItems ?? [],
      clubIdolatries: save.player.clubIdolatries ?? {},
      rival: save.player.rival ?? createCareerRival(save.seed, save.player.age),
      seasonHistory: save.player.seasonHistory ?? [],
    }
    const eventsThisYear = player.eventHistory.filter((entry) => entry.season === player.season && isNarrativeEventId(entry.eventId)).length
    set({ player, seed: save.seed, saveSlot: slot, currentEvent: null, lastResult: null, lastOutcome: null, eventsThisYear })
    return true
  },
  reset: () => set({ player: null, currentEvent: null, lastResult: null, lastOutcome: null, eventsThisYear: 0, seed: 0 }),
}))

function roleForAge(age: number, clubPrestige: number, retired: boolean) {
  if (retired) return 'Retirado'
  if (age < 13) return 'Talento del barrio'
  if (age < 16) return 'Juvenil en formación'
  if (age === 16) return 'Canterano del primer equipo'
  if (age < 20) return clubPrestige >= 90 ? 'Rotación con proyección' : 'Joven titular'
  if (age < 24) return clubPrestige >= 92 ? 'Competencia por la titularidad' : 'Titular en crecimiento'
  if (age < 31) return 'Jugador del primer equipo'
  return 'Veterano del vestuario'
}

function tacticalTraining(focus: TacticalFocusId) {
  const plans = {
    pressing: { title: 'Pizarra: presión alta', choice: 'Ensayaste cuándo saltar a presionar', rewards: { discipline: 2, fitness: 1 } },
    possession: { title: 'Pizarra: cuidar la pelota', choice: 'Trabajaste apoyos y circulación', rewards: { technique: 2, talent: 1 } },
    counter: { title: 'Pizarra: atacar espacios', choice: 'Preparaste transiciones rápidas', rewards: { talent: 2, confidence: 1 } },
  } as const
  return plans[focus]
}

const TRAINING_STAT_LABELS = {
  fitness: 'Velocidad', discipline: 'Disciplina', resilience: 'Resistencia', confidence: 'Mentalidad', technique: 'Pegada', talent: 'Visión',
} as const

const CAREER_UPGRADES = {
  coach: { title: 'Entrenador personal', cost: 5, rewards: { technique: 2, talent: 1 }, result: 'Mejoraste pegada y visión.' },
  sprint: { title: 'Plan de velocidad', cost: 4, rewards: { fitness: 2, resilience: 1 }, result: 'Ganaste velocidad y resistencia.' },
  finishing: { title: 'Clínica de definición', cost: 6, rewards: { technique: 1, confidence: 2 }, result: 'Trabajaste pegada y mentalidad frente al arco.' },
} as const

type TrainingSessionId = 'strength' | 'recovery' | 'tactics'
type TacticalFocusId = 'pressing' | 'possession' | 'counter'
type CareerUpgradeId = keyof typeof CAREER_UPGRADES

function rivalClubFor(currentId: string | null, playerClubId: string | undefined, leagueId: string | undefined, seed: number) {
  if (currentId) return clubById(currentId)
  const candidates = REAL_CLUBS.filter((club) => club.leagueId === leagueId && club.id !== playerClubId)
  return candidates.length ? candidates[Math.abs(seed) % candidates.length] : null
}

export type { PlayerDraft, SaveGame, TrainingSessionId, TacticalFocusId, CareerUpgradeId }
