import { describe, expect, it } from 'vitest'
import { applyChoice, clampStat, seededRandom, selectEvent, stageForAge } from './engine'
import type { CareerEvent, CareerPlayer } from './types'

const player: CareerPlayer = {
  id: 'p1', firstName: 'Lina', lastName: 'Rojas', nickname: '', nationality: 'Ardania', region: 'Puerto Cobalto', gender: 'Femenino', age: 10,
  birthYear: 2016, preferredFoot: 'Derecho', favoriteNumber: 8, primaryPosition: 'Mediocampista', geographicOrigin: 'Barrio popular',
  economicBackground: 'Economía modesta', footballLegacy: 'Sin conexiones', firstFootballEnvironment: 'Partidos en la calle', initialPersonality: 'Creativa',
  careerStage: 'childhood', season: 1, currentClubId: null, clubRole: 'Talento local', activeFlags: [], eventHistory: [], narrativeCharacters: [],
  stats: { talent: 50, technique: 50, fitness: 50, discipline: 50, confidence: 50, resilience: 50, reputation: 3, family: 60, community: 60, finances: 10, goals: 0, assists: 0, matches: 0, trophies: 0 },
}
const event: CareerEvent = { id: 'childhood-test', title: 'La prueba', description: 'Una descripción suficientemente larga para representar una escena narrativa.', stage: 'childhood', category: 'barrio', tags: ['barrio'], rarity: 'common', ageMin: 9, ageMax: 12, baseWeight: 10, oncePerCareer: true, choices: [{ id: 'a', text: 'Aceptar la conversación', riskLabel: 'Riesgo bajo', visibleHint: 'Una pista suficientemente clara', effects: [{ path: 'confidence', operation: 'add', value: 7 }], result: 'El resultado de la decisión deja una consecuencia que será recordada.' }] }

describe('motor de carrera', () => {
  it('calcula las etapas en los límites de edad', () => {
    expect(stageForAge(9)).toBe('childhood'); expect(stageForAge(13)).toBe('academy'); expect(stageForAge(16)).toBe('debut'); expect(stageForAge(23)).toBe('prime'); expect(stageForAge(37)).toBe('retirement')
  })
  it('produce aleatoriedad reproducible', () => {
    const a = seededRandom(42); const b = seededRandom(42)
    expect([a(), a(), a()]).toEqual([b(), b(), b()])
  })
  it('respeta los límites de atributos', () => { expect(clampStat(104)).toBe(100); expect(clampStat(-3)).toBe(0) })
  it('aplica efectos y banderas', () => {
    const changed = applyChoice(player, { ...event.choices[0], flagsToAdd: ['hablo'] })
    expect(changed.stats.confidence).toBe(57); expect(changed.activeFlags).toContain('hablo')
  })
  it('selecciona un evento elegible', () => { expect(selectEvent([event], player, 7).id).toBe(event.id) })
})
