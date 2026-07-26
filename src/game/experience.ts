import type { CareerEvent, EventChoice, EventHistoryEntry, PlayerStats, RiskLabel } from './types'

export const STAT_LABELS: Record<keyof PlayerStats, string> = {
  talent: 'Visión', technique: 'Pegada', fitness: 'Velocidad', discipline: 'Disciplina', confidence: 'Mentalidad',
  resilience: 'Resistencia', reputation: 'Fama', family: 'Familia', community: 'Barrio', finances: 'Dinero',
  goals: 'Goles', assists: 'Asistencias', matches: 'Partidos', trophies: 'Títulos', form: 'Forma',
}

export interface DecisionArchetype {
  id: 'team' | 'head' | 'instinct' | 'voice' | 'endurance'
  label: string
  description: string
}

export interface StatChange {
  stat: keyof PlayerStats
  label: string
  before: number
  after: number
  delta: number
}

export interface DecisionOutcome {
  eventTitle: string
  eventCategory: string
  eventRarity: CareerEvent['rarity']
  choiceText: string
  choiceId: string
  riskLabel: RiskLabel
  result: string
  archetype: DecisionArchetype
  changes: StatChange[]
  tone: 'victory' | 'bittersweet' | 'setback'
}

export function choiceArchetype(choice: Pick<EventChoice, 'id' | 'text'>): DecisionArchetype {
  const source = `${choice.id} ${choice.text}`.toLowerCase()
  if (/(escuchar|ceder|respaldar|pedir-ayuda|hablar-privado|grupo|comunidad)/u.test(source)) {
    return { id: 'team', label: 'Equipo', description: 'Proteges el vínculo antes que el protagonismo.' }
  }
  if (/(esperar|seguir-plan|ser-honesto|familia|acordar)/u.test(source)) {
    return { id: 'head', label: 'Cabeza', description: 'Lees el momento antes de moverte.' }
  }
  if (/(hacer-publico|contar|decir|respaldar-público)/u.test(source)) {
    return { id: 'voice', label: 'Voz propia', description: 'Tomas el control de la historia.' }
  }
  if (/(asumir|guardar|mantenerte|competir|aguantar)/u.test(source)) {
    return { id: 'endurance', label: 'Resistencia', description: 'Cargas el peso y sigues adelante.' }
  }
  return { id: 'instinct', label: 'Instinto', description: 'Aceleras y aceptas el riesgo.' }
}

export function riskLevel(label: RiskLabel) {
  const levels: Record<RiskLabel, number> = {
    'Riesgo mínimo': 1, 'Riesgo bajo': 2, 'Riesgo moderado': 3, 'Riesgo alto': 4, 'Riesgo extremo': 5, 'Resultado impredecible': 4,
  }
  return levels[label]
}

export function presentedRiskLabel(choice: EventChoice): RiskLabel {
  const downside = choice.effects.reduce((total, effect) => {
    if (effect.operation === 'add' && effect.value < 0) return total + Math.abs(effect.value)
    if (effect.operation === 'multiply' && effect.value < 1) return total + Math.ceil((1 - effect.value) * 5)
    return total
  }, 0)
  if (downside === 0) return 'Riesgo mínimo'
  if (downside === 1) return 'Riesgo bajo'
  if (downside === 2) return 'Riesgo moderado'
  if (choice.riskLabel === 'Resultado impredecible') return 'Resultado impredecible'
  if (downside <= 4) return 'Riesgo alto'
  return 'Riesgo extremo'
}

export function sceneProfile(event: CareerEvent) {
  const source = `${event.category} ${event.tags.join(' ')}`.toLowerCase()
  if (/(familia|amistad|hermano|madre|padre)/u.test(source)) return { id: 'bond', icon: '◇', label: 'VÍNCULOS', line: 'Una relación importante puede cambiar hoy.' }
  if (/(econom|contrato|sueldo|patrocin|representante)/u.test(source)) return { id: 'future', icon: '$', label: 'FUTURO', line: 'La oportunidad tiene un precio que no aparece en el contrato.' }
  if (/(lesión|salud|nutrición|físico|médic)/u.test(source)) return { id: 'body', icon: '+', label: 'CUERPO', line: 'La ambición y el cuerpo están negociando.' }
  if (/(prensa|fama|afición|selección|comunidad)/u.test(source)) return { id: 'spotlight', icon: '●', label: 'EXPOSICIÓN', line: 'Lo que hagas puede salir del vestuario.' }
  if (/(final|torneo|partido|debut|competencia)/u.test(source)) return { id: 'match', icon: '⚑', label: 'COMPETENCIA', line: 'El próximo paso se juega ahora.' }
  return { id: 'locker', icon: '▤', label: 'VESTUARIO', line: 'El grupo observa incluso cuando nadie habla.' }
}

export function eventStakeStats(event: CareerEvent) {
  const seen = new Set<keyof PlayerStats>()
  for (const choice of event.choices) for (const effect of choice.effects) seen.add(effect.path)
  return [...seen].map((stat) => ({ stat, label: STAT_LABELS[stat] })).slice(0, 5)
}

export function buildDecisionOutcome(event: CareerEvent, choice: EventChoice, before: PlayerStats, after: PlayerStats): DecisionOutcome {
  const changes = [...new Set(choice.effects.map((effect) => effect.path))].map((stat) => ({
    stat, label: STAT_LABELS[stat], before: before[stat], after: after[stat], delta: after[stat] - before[stat],
  })).filter((change) => change.delta !== 0)
  const positive = changes.some((change) => change.delta > 0)
  const negative = changes.some((change) => change.delta < 0)
  return {
    eventTitle: event.title, eventCategory: event.category, eventRarity: event.rarity, choiceText: choice.text, choiceId: choice.id,
    riskLabel: presentedRiskLabel(choice), result: choice.result, archetype: choiceArchetype(choice), changes,
    tone: positive && negative ? 'bittersweet' : negative ? 'setback' : 'victory',
  }
}

export function careerDecisionIdentity(history: EventHistoryEntry[]) {
  const decisions = history.filter((entry) => !entry.eventId.startsWith('training-')).slice(-6)
  if (!decisions.length) return { ...choiceArchetype({ id: 'esperar', text: '' }), count: 0 }
  const scores = new Map<DecisionArchetype['id'], { archetype: DecisionArchetype; count: number }>()
  for (const entry of decisions) {
    const archetype = choiceArchetype({ id: entry.choiceId, text: entry.choiceText })
    scores.set(archetype.id, { archetype, count: (scores.get(archetype.id)?.count ?? 0) + 1 })
  }
  const winner = [...scores.values()].sort((a, b) => b.count - a.count)[0]
  return { ...winner.archetype, count: winner.count }
}
