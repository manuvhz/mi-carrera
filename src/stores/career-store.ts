import { create } from 'zustand'
import { APP_CONFIG } from '../config'
import { CAREER_EVENTS } from '../content/load-events'
import { CLUBS } from '../content/world'
import { applyChoice, selectEvent, simulateSeasonStats, stageForAge } from '../game/engine'
import type { CareerEvent, CareerPlayer, EventChoice, SaveGame } from '../game/types'
import { loadCareer, saveCareer } from '../persistence/database'

interface PlayerDraft {
  firstName: string; lastName: string; nickname: string; nationality: string; region: string; gender: string
  age: number; preferredFoot: 'Izquierdo' | 'Derecho' | 'Ambos'; favoriteNumber: number; primaryPosition: string
  geographicOrigin: string; economicBackground: string; footballLegacy: string; firstFootballEnvironment: string; initialPersonality: string
}

interface CareerState {
  seed: number
  player: CareerPlayer | null
  currentEvent: CareerEvent | null
  lastResult: string | null
  eventsThisYear: number
  saveSlot: number
  createCareer: (draft: PlayerDraft, seed?: number) => void
  drawEvent: () => void
  resolveChoice: (choice: EventChoice) => void
  continueAfterResult: () => void
  advanceYear: () => void
  save: () => Promise<void>
  load: (slot: number) => Promise<boolean>
  reset: () => void
}

const initialStats = { talent: 48, technique: 42, fitness: 62, discipline: 50, confidence: 48, resilience: 52, reputation: 3, family: 65, community: 55, finances: 12, goals: 0, assists: 0, matches: 0, trophies: 0 }

export const useCareerStore = create<CareerState>((set, get) => ({
  seed: 0, player: null, currentEvent: null, lastResult: null, eventsThisYear: 0, saveSlot: 1,
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
    set({ seed, player, currentEvent: null, lastResult: null, eventsThisYear: 0 })
  },
  drawEvent: () => {
    const { player, seed } = get()
    if (!player) return
    set({ currentEvent: selectEvent(CAREER_EVENTS, player, seed), lastResult: null })
  },
  resolveChoice: (choice) => {
    const { player, currentEvent, eventsThisYear } = get()
    if (!player || !currentEvent) return
    const changed = applyChoice(player, choice)
    const next: CareerPlayer = {
      ...changed,
      eventHistory: [...changed.eventHistory, {
        eventId: currentEvent.id, title: currentEvent.title, age: player.age, season: player.season,
        choiceId: choice.id, choiceText: choice.text, result: choice.result, date: new Date().toISOString(),
      }],
    }
    set({ player: next, currentEvent: null, lastResult: choice.result, eventsThisYear: eventsThisYear + 1 })
    void get().save()
  },
  continueAfterResult: () => set({ lastResult: null }),
  advanceYear: () => {
    const { player, seed } = get()
    if (!player) return
    const simulated = simulateSeasonStats(player, seed)
    const age = simulated.age + 1
    const retired = age >= APP_CONFIG.retirementAge
    const firstClub = age >= 16 && !simulated.currentClubId ? CLUBS[seed % CLUBS.length].name : simulated.currentClubId
    const next = { ...simulated, age, season: simulated.season + 1, careerStage: retired ? 'retirement' as const : stageForAge(age), currentClubId: firstClub, clubRole: age < 13 ? 'Talento del barrio' : age < 16 ? 'Juvenil en formación' : age < 23 ? 'Profesional en crecimiento' : age < 32 ? 'Jugador del primer equipo' : 'Veterano del vestuario' }
    set({ player: next, eventsThisYear: 0, currentEvent: null, lastResult: null })
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
    set({ player: save.player, seed: save.seed, saveSlot: slot, currentEvent: null, lastResult: null, eventsThisYear: 0 })
    return true
  },
  reset: () => set({ player: null, currentEvent: null, lastResult: null, eventsThisYear: 0, seed: 0 }),
}))

export type { PlayerDraft, SaveGame }
