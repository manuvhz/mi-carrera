import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useCareerStore, type PlayerDraft } from './career-store'

vi.mock('../persistence/database', () => ({ saveCareer: vi.fn(), loadCareer: vi.fn() }))

const draft: PlayerDraft = {
  firstName: 'Lina', lastName: 'Rojas', nickname: '', nationality: 'Argentina', region: 'Jujuy', gender: 'Femenino', age: 10,
  preferredFoot: 'Derecho', favoriteNumber: 9, favoriteClubId: 'gimnasia-jujuy', primaryPosition: 'Delantero', geographicOrigin: 'Barrio popular',
  economicBackground: 'Familia trabajadora', footballLegacy: 'Sin conexiones', firstFootballEnvironment: 'Partidos en la calle', initialPersonality: 'Competitiva',
}

describe('entrenamientos de carrera', () => {
  beforeEach(() => {
    useCareerStore.getState().reset()
    useCareerStore.getState().createCareer(draft, 57)
  })

  it('aplica la recompensa solo una vez por minijuego y temporada', () => {
    const before = useCareerStore.getState().player!.stats.technique
    useCareerStore.getState().completeMiniGame('penalties', 3, 3)
    useCareerStore.getState().completeMiniGame('penalties', 3, 3)
    const player = useCareerStore.getState().player!
    expect(player.stats.technique).toBe(before + 5)
    expect(player.eventHistory.filter((entry) => entry.eventId === 'training-penalties')).toHaveLength(1)
  })

  it('aplica un estilo permanente una sola vez', () => {
    useCareerStore.getState().choosePlaystyle('allrounder')
    useCareerStore.getState().choosePlaystyle('finisher')
    const player = useCareerStore.getState().player!
    expect(player.activeFlags).toContain('playstyle:allrounder')
    expect(player.activeFlags).not.toContain('playstyle:finisher')
    expect(player.stats.talent).toBe(51)
  })
})
