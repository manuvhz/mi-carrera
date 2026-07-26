import { create } from 'zustand'
import { APP_CONFIG } from '../config'
import { CAREER_EVENTS } from '../content/load-events'
import { clubById, DEFAULT_CLUB_ID } from '../content/real-clubs'
import { applyChoice, selectEvent, simulateSeasonStats, stageForAge } from '../game/engine'
import { buildDecisionOutcome, type DecisionOutcome } from '../game/experience'
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
  advanceYear: () => void
  choosePlaystyle: (styleId: 'finisher' | 'engine' | 'allrounder') => void
  completeTrainingSession: (sessionId: TrainingSessionId, tacticalFocus?: TacticalFocusId) => void
  completeMiniGame: (gameId: 'penalties' | 'reactions' | 'passing', score: number, maximum: number) => void
  save: () => Promise<void>
  load: (slot: number) => Promise<boolean>
  reset: () => void
}

const initialStats = { talent: 48, technique: 42, fitness: 62, discipline: 50, confidence: 48, resilience: 52, reputation: 3, family: 65, community: 55, finances: 12, goals: 0, assists: 0, matches: 0, trophies: 0 }

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
  advanceYear: () => {
    const { player, seed } = get()
    if (!player) return
    const simulated = simulateSeasonStats(player, seed)
    const age = simulated.age + 1
    const retired = age >= APP_CONFIG.retirementAge
    const firstClub = age >= 16 && !simulated.currentClubId ? clubById(simulated.favoriteClubId ?? DEFAULT_CLUB_ID).name : simulated.currentClubId
    const next = { ...simulated, age, season: simulated.season + 1, careerStage: retired ? 'retirement' as const : stageForAge(age), currentClubId: firstClub, clubRole: age < 13 ? 'Talento del barrio' : age < 16 ? 'Juvenil en formación' : age < 23 ? 'Profesional en crecimiento' : age < 32 ? 'Jugador del primer equipo' : 'Veterano del vestuario' }
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
      stats[stat] = Math.min(100, stats[stat] + Number(value))
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
      strength: { title: 'Trabajo de fuerza', choice: 'Completaste una sesión física guiada', rewards: { fitness: 3, discipline: 1 } },
      recovery: { title: 'Recuperación activa', choice: 'Priorizaste la recuperación y el cuidado físico', rewards: { resilience: 3, confidence: 1 } },
      tactics: tacticalTraining(tacticalFocus ?? 'possession'),
    } as const
    const session = sessions[sessionId]
    const stats = { ...player.stats }
    for (const [key, value] of Object.entries(session.rewards)) {
      const stat = key as keyof typeof stats
      stats[stat] = Math.min(100, stats[stat] + value)
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
    for (const stat of gameRewards[gameId]) stats[stat] = Math.min(100, stats[stat] + level)
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
  save: async () => {
    const { player, seed, saveSlot } = get()
    if (!player) return
    await saveCareer(saveSlot, { version: APP_CONFIG.saveVersion, seed, player, updatedAt: new Date().toISOString() })
  },
  load: async (slot) => {
    const save = await loadCareer(slot)
    if (!save) return false
    const eventsThisYear = save.player.eventHistory.filter((entry) => entry.season === save.player.season && !entry.eventId.startsWith('training-')).length
    set({ player: save.player, seed: save.seed, saveSlot: slot, currentEvent: null, lastResult: null, lastOutcome: null, eventsThisYear })
    return true
  },
  reset: () => set({ player: null, currentEvent: null, lastResult: null, lastOutcome: null, eventsThisYear: 0, seed: 0 }),
}))

function tacticalTraining(focus: TacticalFocusId) {
  const plans = {
    pressing: { title: 'Pizarra: presión alta', choice: 'Ensayaste cuándo saltar a presionar', rewards: { discipline: 2, fitness: 1 } },
    possession: { title: 'Pizarra: cuidar la pelota', choice: 'Trabajaste apoyos y circulación', rewards: { technique: 2, talent: 1 } },
    counter: { title: 'Pizarra: atacar espacios', choice: 'Preparaste transiciones rápidas', rewards: { talent: 2, confidence: 1 } },
  } as const
  return plans[focus]
}

const TRAINING_STAT_LABELS = {
  fitness: 'Físico', discipline: 'Disciplina', resilience: 'Resistencia', confidence: 'Confianza', technique: 'Técnica', talent: 'Talento',
} as const

type TrainingSessionId = 'strength' | 'recovery' | 'tactics'
type TacticalFocusId = 'pressing' | 'possession' | 'counter'

export type { PlayerDraft, SaveGame, TrainingSessionId, TacticalFocusId }
