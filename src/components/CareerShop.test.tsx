import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { CareerPlayer } from '../game/types'
import { CareerShop } from './CareerShop'

const player = {
  stats: { finances: 12 }, careerEarnings: 0, ownedItems: [],
} as unknown as CareerPlayer

describe('tienda de carrera', () => {
  it('explica las categorías y permite comprar un objeto asequible', () => {
    const onPurchase = vi.fn()
    render(<CareerShop player={player} onPurchase={onPurchase} />)
    expect(screen.getByText('Staff')).toBeInTheDocument()
    expect(screen.getByText('Lujo')).toBeInTheDocument()
    expect(screen.getByText('Legado')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Comprar Reloj de rendimiento' }))
    expect(onPurchase).toHaveBeenCalledWith('smart-watch')
  })
})
