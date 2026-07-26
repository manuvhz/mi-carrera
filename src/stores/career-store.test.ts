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

  it('registra una rutina rápida una sola vez por temporada', () => {
    const before = useCareerStore.getState().player!.stats.fitness
    useCareerStore.getState().completeTrainingSession('strength')
    useCareerStore.getState().completeTrainingSession('strength')
    const player = useCareerStore.getState().player!
    expect(player.stats.fitness).toBe(before + 3)
    expect(player.eventHistory.filter((entry) => entry.eventId === 'training-strength')).toHaveLength(1)
  })

  it('permite elegir el foco de una sesión táctica', () => {
    const before = useCareerStore.getState().player!.stats.technique
    useCareerStore.getState().completeTrainingSession('tactics', 'possession')
    const player = useCareerStore.getState().player!
    expect(player.stats.technique).toBe(before + 2)
    expect(player.eventHistory.at(-1)?.choiceText).toContain('circulación')
  })

  it('guarda el impacto visible de una decisión narrativa', () => {
    useCareerStore.getState().drawEvent()
    const event = useCareerStore.getState().currentEvent!
    const before = useCareerStore.getState().player!.stats
    useCareerStore.getState().resolveChoice(event.choices[0])
    const outcome = useCareerStore.getState().lastOutcome!
    expect(outcome.eventTitle).toBe(event.title)
    expect(outcome.changes.length).toBeGreaterThan(0)
    expect(outcome.changes.some((change) => change.before !== change.after)).toBe(true)
    expect(useCareerStore.getState().player!.stats).not.toEqual(before)
  })

  it('aplica un estilo permanente una sola vez', () => {
    useCareerStore.getState().choosePlaystyle('allrounder')
    useCareerStore.getState().choosePlaystyle('finisher')
    const player = useCareerStore.getState().player!
    expect(player.activeFlags).toContain('playstyle:allrounder')
    expect(player.activeFlags).not.toContain('playstyle:finisher')
    expect(player.stats.talent).toBe(51)
  })

  it('firma el primer contrato con un id de club válido', () => {
    const player = useCareerStore.getState().player!
    useCareerStore.setState({ player: { ...player, age: 15, season: 6, careerStage: 'academy', favoriteClubId: 'barcelona' } })
    useCareerStore.getState().advanceYear('barcelona')
    const professional = useCareerStore.getState().player!
    expect(professional.age).toBe(16)
    expect(professional.currentClubId).toBe('barcelona')
    expect(professional.eventHistory.at(-1)?.eventId).toContain('transfer-7-barcelona')
  })

  it('registra un fichaje europeo sin contarlo como acontecimiento de temporada', () => {
    const player = useCareerStore.getState().player!
    useCareerStore.setState({ player: { ...player, age: 20, season: 11, careerStage: 'consolidation', currentClubId: 'gimnasia-jujuy' } })
    useCareerStore.getState().advanceYear('arsenal')
    const transferred = useCareerStore.getState().player!
    expect(transferred.currentClubId).toBe('arsenal')
    expect(transferred.eventHistory.at(-1)?.result).toContain('Premier League')
    expect(useCareerStore.getState().eventsThisYear).toBe(0)
  })
})
