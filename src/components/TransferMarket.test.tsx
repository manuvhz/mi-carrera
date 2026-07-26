import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { transferOffersFor } from '../game/transfer-market'
import type { CareerPlayer } from '../game/types'
import { TransferMarket } from './TransferMarket'

const academyPlayer: CareerPlayer = {
  id: 'academy-player', firstName: 'Alex', lastName: 'Martín', nickname: '', nationality: 'España', region: 'Barcelona', gender: 'No binario', age: 15,
  birthYear: 2011, preferredFoot: 'Izquierdo', favoriteNumber: 10, favoriteClubId: 'barcelona', primaryPosition: 'Mediocampista', geographicOrigin: 'Ciudad intermedia',
  economicBackground: 'Economía modesta', footballLegacy: 'Sin conexiones', firstFootballEnvironment: 'Equipo escolar', initialPersonality: 'Creativo', careerStage: 'academy',
  season: 6, currentClubId: null, clubRole: 'Juvenil en formación', activeFlags: [], eventHistory: [], narrativeCharacters: [],
  stats: { talent: 58, technique: 57, fitness: 61, discipline: 55, confidence: 53, resilience: 57, reputation: 9, family: 61, community: 55, finances: 12, goals: 4, assists: 5, matches: 35, trophies: 0, form: 55 },
}

describe('mercado visual', () => {
  it('muestra el primer contrato y permite marcar otro destino', () => {
    const offers = transferOffersFor(academyPlayer, 33)
    const onChange = vi.fn()
    render(<TransferMarket player={academyPlayer} offers={offers} value="barcelona" onChange={onChange} />)
    expect(screen.getByText('Tu carrera profesional empieza aquí.')).toBeInTheDocument()
    expect(screen.getAllByRole('radio')).toHaveLength(3)
    fireEvent.click(screen.getAllByRole('radio')[1])
    expect(onChange).toHaveBeenCalledWith(offers[1].club.id)
  })
})
