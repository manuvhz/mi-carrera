import { describe, expect, it } from 'vitest'
import { buildDecisionOutcome, careerDecisionIdentity, choiceArchetype, presentedRiskLabel, riskLevel } from './experience'
import type { CareerEvent, EventChoice, EventHistoryEntry, PlayerStats } from './types'

const stats: PlayerStats = { talent: 50, technique: 50, fitness: 50, discipline: 50, confidence: 50, resilience: 50, reputation: 10, family: 50, community: 50, finances: 10, goals: 0, assists: 0, matches: 0, trophies: 0 }

describe('experiencia de decisiones', () => {
  it('clasifica estilos y niveles de riesgo', () => {
    expect(choiceArchetype({ id: 'escuchar', text: 'Escuchar a tu capitán' }).label).toBe('Equipo')
    expect(choiceArchetype({ id: 'aceptar', text: 'Aceptar ahora' }).label).toBe('Instinto')
    expect(riskLevel('Riesgo extremo')).toBe(5)
    expect(presentedRiskLabel({ id: 'a', text: 'Hablar', riskLabel: 'Riesgo alto', visibleHint: 'Pista', effects: [{ path: 'reputation', operation: 'add', value: -1 }], result: 'Resultado' })).toBe('Riesgo bajo')
  })

  it('construye una consecuencia con cambios visibles', () => {
    const event = { id: 'test', title: 'La prueba', category: 'familia', rarity: 'common', choices: [] } as unknown as CareerEvent
    const choice: EventChoice = { id: 'esperar', text: 'Pedir tiempo', riskLabel: 'Riesgo moderado', visibleHint: 'Pista', effects: [{ path: 'discipline', operation: 'add', value: 3 }, { path: 'reputation', operation: 'add', value: -1 }], result: 'Una consecuencia suficientemente larga.' }
    const outcome = buildDecisionOutcome(event, choice, stats, { ...stats, discipline: 53, reputation: 9 })
    expect(outcome.tone).toBe('bittersweet')
    expect(outcome.changes.map((change) => change.delta)).toEqual([3, -1])
    expect(outcome.riskLabel).toBe('Riesgo bajo')
  })

  it('resume la identidad de las últimas decisiones', () => {
    const history = ['escuchar', 'hablar-privado', 'aceptar'].map((choiceId, index) => ({ eventId: `event-${index}`, title: 'Evento', age: 12, season: 1, choiceId, choiceText: choiceId, result: 'Resultado', date: String(index) })) as EventHistoryEntry[]
    expect(careerDecisionIdentity(history).label).toBe('Equipo')
  })
})
