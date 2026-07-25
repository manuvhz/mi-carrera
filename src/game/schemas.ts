import { z } from 'zod'
import { STAGES } from './types'

export const statEffectSchema = z.object({
  path: z.enum(['talent', 'technique', 'fitness', 'discipline', 'confidence', 'resilience', 'reputation', 'family', 'community', 'finances', 'goals', 'assists', 'matches', 'trophies']),
  operation: z.enum(['add', 'set', 'multiply']),
  value: z.number(),
})

export const eventChoiceSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(8),
  riskLabel: z.enum(['Riesgo mínimo', 'Riesgo bajo', 'Riesgo moderado', 'Riesgo alto', 'Riesgo extremo', 'Resultado impredecible']),
  visibleHint: z.string().min(8),
  effects: z.array(statEffectSchema).min(1),
  result: z.string().min(20),
  flagsToAdd: z.array(z.string()).optional(),
})

export const careerEventSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(5),
  description: z.string().min(40),
  stage: z.enum(STAGES),
  category: z.string().min(3),
  tags: z.array(z.string()).min(1),
  rarity: z.enum(['common', 'uncommon', 'rare', 'legendary']),
  ageMin: z.number().int().min(9).max(45),
  ageMax: z.number().int().min(9).max(45),
  baseWeight: z.number().positive(),
  oncePerCareer: z.boolean(),
  chainId: z.string().optional(),
  choices: z.array(eventChoiceSchema).min(2).max(4),
}).refine((event) => event.ageMin <= event.ageMax, 'El rango de edad es inválido')

export const eventFileSchema = z.object({ events: z.array(careerEventSchema).max(25) })

const historySchema = z.object({
  eventId: z.string(), title: z.string(), age: z.number(), season: z.number(),
  choiceId: z.string(), choiceText: z.string(), result: z.string(), date: z.string(),
})

const statsSchema = z.object({
  talent: z.number(), technique: z.number(), fitness: z.number(), discipline: z.number(),
  confidence: z.number(), resilience: z.number(), reputation: z.number(), family: z.number(),
  community: z.number(), finances: z.number(), goals: z.number(), assists: z.number(),
  matches: z.number(), trophies: z.number(),
})

export const saveGameSchema = z.object({
  version: z.number().int(), seed: z.number().int(), updatedAt: z.string(),
  player: z.object({
    id: z.string(), firstName: z.string(), lastName: z.string(), nickname: z.string(),
    nationality: z.string(), region: z.string(), gender: z.string(), age: z.number(), birthYear: z.number(),
    preferredFoot: z.enum(['Izquierdo', 'Derecho', 'Ambos']), favoriteNumber: z.number(), favoriteClubId: z.string().optional(), primaryPosition: z.string(),
    geographicOrigin: z.string(), economicBackground: z.string(), footballLegacy: z.string(),
    firstFootballEnvironment: z.string(), initialPersonality: z.string(), careerStage: z.enum(STAGES),
    season: z.number(), currentClubId: z.string().nullable(), clubRole: z.string(),
    activeFlags: z.array(z.string()), eventHistory: z.array(historySchema),
    narrativeCharacters: z.array(z.object({ id: z.string(), name: z.string(), role: z.string(), relationshipValue: z.number(), activeStatus: z.boolean(), history: z.array(z.string()) })),
    stats: statsSchema,
  }),
})
