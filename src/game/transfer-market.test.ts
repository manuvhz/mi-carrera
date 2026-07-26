import { describe, expect, it } from 'vitest'
import type { CareerPlayer } from './types'
import { playerMarketScore, transferOffersFor } from './transfer-market'

const player: CareerPlayer = {
  id: 'market-player', firstName: 'Lina', lastName: 'Rojas', nickname: '', nationality: 'Argentina', region: 'Jujuy', gender: 'Femenino', age: 18,
  birthYear: 2008, preferredFoot: 'Derecho', favoriteNumber: 9, favoriteClubId: 'gimnasia-jujuy', primaryPosition: 'Delantero', geographicOrigin: 'Barrio popular',
  economicBackground: 'Familia trabajadora', footballLegacy: 'Sin conexiones', firstFootballEnvironment: 'Calle', initialPersonality: 'Competitiva',
  careerStage: 'debut', season: 9, currentClubId: 'gimnasia-jujuy', clubRole: 'Profesional en crecimiento', activeFlags: [], eventHistory: [], narrativeCharacters: [],
  stats: { talent: 55, technique: 54, fitness: 61, discipline: 58, confidence: 52, resilience: 57, reputation: 12, family: 60, community: 55, finances: 14, goals: 8, assists: 4, matches: 32, trophies: 0, form: 55 },
}

describe('mercado de fichajes', () => {
  it('genera tres ofertas deterministas dentro del nivel alcanzado', () => {
    const first = transferOffersFor(player, 91)
    const second = transferOffersFor(player, 91)
    expect(first).toHaveLength(3)
    expect(first.map((offer) => offer.club.id)).toEqual(second.map((offer) => offer.club.id))
    expect(first.every((offer) => offer.club.prestige <= playerMarketScore(player) + 40)).toBe(true)
  })

  it('incluye al club elegido al llegar el primer contrato', () => {
    const academyPlayer = { ...player, age: 15, currentClubId: null, favoriteClubId: 'barcelona' }
    const offers = transferOffersFor(academyPlayer, 91)
    expect(offers[0].club.id).toBe('barcelona')
    expect(offers[0].interest).toBe('Primer contrato profesional')
  })

  it('abre clubes de élite cuando la carrera alcanza nivel mundial', () => {
    const elitePlayer = { ...player, age: 25, stats: { ...player.stats, talent: 92, technique: 93, fitness: 89, confidence: 94, reputation: 88, goals: 120, assists: 70, matches: 240 } }
    expect(playerMarketScore(elitePlayer)).toBeGreaterThan(90)
    expect(transferOffersFor(elitePlayer, 14).some((offer) => offer.club.prestige >= 90)).toBe(true)
  })
})
