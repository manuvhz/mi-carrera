import { describe, expect, it } from 'vitest'
import { CAREER_EVENTS } from './load-events'
import { FOOTBALL_REGIONS, REAL_CLUBS } from './real-clubs'
import { presentedRiskLabel } from '../game/experience'

describe('inventario narrativo', () => {
  it('contiene exactamente 500 ids únicos', () => { expect(CAREER_EVENTS).toHaveLength(500); expect(new Set(CAREER_EVENTS.map((event) => event.id)).size).toBe(500) })
  it('respeta la distribución por etapa', () => {
    expect(Object.fromEntries(['childhood','academy','debut','consolidation','prime','veteran','final-years','retirement'].map((stage) => [stage, CAREER_EVENTS.filter((event) => event.stage === stage).length]))).toEqual({ childhood:70, academy:85, debut:95, consolidation:90, prime:70, veteran:45, 'final-years':30, retirement:15 })
  })
  it('respeta la distribución por rareza', () => {
    expect(Object.fromEntries(['common','uncommon','rare','legendary'].map((rarity) => [rarity, CAREER_EVENTS.filter((event) => event.rarity === rarity).length]))).toEqual({ common:260, uncommon:150, rare:70, legendary:20 })
  })
  it('mantiene 120 pasos en al menos 20 cadenas', () => { const chained = CAREER_EVENTS.filter((event) => event.chainId); expect(chained).toHaveLength(120); expect(new Set(chained.map((event) => event.chainId)).size).toBeGreaterThanOrEqual(20) })
  it('presenta más decisiones de riesgo bajo que extremo', () => {
    const labels = CAREER_EVENTS.flatMap((event) => event.choices.map(presentedRiskLabel))
    const calm = labels.filter((label) => label === 'Riesgo mínimo' || label === 'Riesgo bajo').length
    const severe = labels.filter((label) => label === 'Riesgo extremo' || label === 'Resultado impredecible').length
    expect(calm).toBeGreaterThan(severe)
    expect(new Set(labels)).toEqual(new Set(['Riesgo bajo', 'Riesgo moderado']))
  })
  it('incluye Brasil y amplía las ligas jugables a 64 clubes', () => {
    expect(FOOTBALL_REGIONS.map((region) => region.id)).toContain('brazil')
    expect(REAL_CLUBS).toHaveLength(64)
    expect(REAL_CLUBS.filter((club) => club.leagueId === 'brazil')).toHaveLength(12)
    expect(FOOTBALL_REGIONS.every((region) => REAL_CLUBS.filter((club) => club.leagueId === region.id).length >= 8)).toBe(true)
  })
})
