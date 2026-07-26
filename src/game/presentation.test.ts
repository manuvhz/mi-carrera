import { describe, expect, it } from 'vitest'
import { CAREER_EVENTS } from '../content/load-events'
import { presentChoiceText, presentEventDescription, presentEventResult, presentEventTitle } from './presentation'

describe('presentación compacta de eventos', () => {
  it('elimina la etapa repetida del título visible', () => {
    expect(presentEventTitle('El relevo sin dueño junto a la familia — Infancia y barrio')).toBe('El relevo sin dueño junto a la familia')
  })

  it('convierte las opciones repetitivas en acciones directas', () => {
    const title = 'El relevo sin dueño junto a la familia — Infancia y barrio'
    expect(presentChoiceText(`Resolver “${title}” en privado con el director de la academia`, title)).toBe('Hablar en privado con el director de la academia')
    expect(presentChoiceText(`Contar tu versión de “${title}” antes de que otros la definan`, title)).toBe('Contar tu versión antes de que otros la definan')
  })

  it('corrige gramática básica en escenas y consecuencias', () => {
    expect(presentEventDescription('tu madre habla. un rival escucha.', 'Evento')).toBe('Tu madre habla. Un rival escucha.')
    expect(presentEventResult('Sales de el estadio y hablas a el técnico.', 'Evento')).toBe('Sales del estadio y hablas al técnico.')
  })

  it('quita el título repetido de todo el catálogo sin dejar opciones vacías', () => {
    for (const event of CAREER_EVENTS) {
      expect(presentEventDescription(event.description, event.title)).not.toContain(event.title)
      for (const choice of event.choices) {
        const presented = presentChoiceText(choice.text, event.title)
        expect(presented).not.toContain(event.title)
        expect(presented.length).toBeGreaterThan(8)
        expect(presented.length).toBeLessThanOrEqual(choice.text.length)
        expect(presentEventResult(choice.result, event.title)).not.toContain(event.title)
      }
    }
  })
})
