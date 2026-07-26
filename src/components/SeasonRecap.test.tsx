import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { CareerPlayer } from '../game/types'
import { SeasonRecap } from './SeasonRecap'

const champion: CareerPlayer = {
  id: 'champion', firstName: 'Lina', lastName: 'Rojas', nickname: '', nationality: 'Argentina', region: 'Jujuy', gender: 'Femenino', age: 25,
  birthYear: 2001, preferredFoot: 'Derecho', favoriteNumber: 9, favoriteClubId: 'gimnasia-jujuy', primaryPosition: 'Delantero',
  geographicOrigin: 'Barrio popular', economicBackground: 'Familia trabajadora', footballLegacy: 'Sin conexiones', firstFootballEnvironment: 'Partidos en la calle', initialPersonality: 'Competitiva',
  careerStage: 'prime', season: 12, currentClubId: 'gimnasia-jujuy', clubRole: 'Jugador del primer equipo', activeFlags: [], eventHistory: [], narrativeCharacters: [],
  stats: { talent: 99, technique: 99, fitness: 99, discipline: 99, confidence: 99, resilience: 99, reputation: 90, family: 60, community: 60, finances: 12, goals: 120, assists: 55, matches: 240, trophies: 2, form: 90 },
}

describe('anuario de temporada', () => {
  it('convierte un campeonato en una celebración visible', () => {
    render(<SeasonRecap player={champion} seed={0} onAdvance={vi.fn()} />)
    expect(screen.getByText('¡LEVANTASTE LA LIGA!')).toBeInTheDocument()
    expect(screen.getAllByText('Campeón de la temporada').length).toBeGreaterThan(0)
    expect(screen.getAllByText('#1').length).toBeGreaterThan(0)
  })
})
