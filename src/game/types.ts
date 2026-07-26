export const STAGES = [
  'childhood',
  'academy',
  'debut',
  'consolidation',
  'prime',
  'veteran',
  'final-years',
  'retirement',
] as const

export type CareerStage = (typeof STAGES)[number]
export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary'
export type RiskLabel = 'Riesgo mínimo' | 'Riesgo bajo' | 'Riesgo moderado' | 'Riesgo alto' | 'Riesgo extremo' | 'Resultado impredecible'

export interface StatEffect {
  path: keyof PlayerStats
  operation: 'add' | 'set' | 'multiply'
  value: number
}

export interface EventChoice {
  id: string
  text: string
  riskLabel: RiskLabel
  visibleHint: string
  effects: StatEffect[]
  result: string
  flagsToAdd?: string[]
}

export interface CareerEvent {
  id: string
  title: string
  description: string
  stage: CareerStage
  category: string
  tags: string[]
  rarity: Rarity
  ageMin: number
  ageMax: number
  baseWeight: number
  oncePerCareer: boolean
  chainId?: string
  choices: EventChoice[]
}

export interface PlayerStats {
  talent: number
  technique: number
  fitness: number
  discipline: number
  confidence: number
  resilience: number
  reputation: number
  family: number
  community: number
  finances: number
  goals: number
  assists: number
  matches: number
  trophies: number
  form: number
}

export interface CompetitionResult {
  id: string
  name: string
  result: string
  won: boolean
  kind: 'league' | 'cup' | 'continental' | 'international' | 'individual'
}

export interface SeasonRecord {
  season: number
  age: number
  clubId: string
  leaguePosition: number
  matches: number
  goals: number
  assists: number
  overall: number
  form: number
  earnings: number
  titles: string[]
  competitions: CompetitionResult[]
  individualAwards: string[]
}

export interface CareerRival {
  name: string
  nickname: string
  age: number
  currentClubId: string | null
  goals: number
  assists: number
  matches: number
  trophies: number
  reputation: number
  nationalTeamCaps?: number
}

export interface InternationalCareer {
  calledUp: boolean
  caps: number
  goals: number
  trophies: number
}

export interface CareerPlayer {
  id: string
  firstName: string
  lastName: string
  nickname: string
  nationality: string
  region: string
  gender: string
  age: number
  birthYear: number
  preferredFoot: 'Izquierdo' | 'Derecho' | 'Ambos'
  favoriteNumber: number
  favoriteClubId?: string
  primaryPosition: string
  geographicOrigin: string
  economicBackground: string
  footballLegacy: string
  firstFootballEnvironment: string
  initialPersonality: string
  careerStage: CareerStage
  season: number
  currentClubId: string | null
  clubRole: string
  activeFlags: string[]
  eventHistory: EventHistoryEntry[]
  narrativeCharacters: NarrativeCharacter[]
  stats: PlayerStats
  careerEarnings?: number
  ownedItems?: string[]
  clubIdolatries?: Record<string, number>
  rival?: CareerRival
  seasonHistory?: SeasonRecord[]
  nationalTeam?: InternationalCareer
}

export interface EventHistoryEntry {
  eventId: string
  title: string
  age: number
  season: number
  choiceId: string
  choiceText: string
  result: string
  date: string
}

export interface NarrativeCharacter {
  id: string
  name: string
  role: string
  relationshipValue: number
  activeStatus: boolean
  history: string[]
}

export interface SaveGame {
  version: number
  seed: number
  player: CareerPlayer
  updatedAt: string
}
