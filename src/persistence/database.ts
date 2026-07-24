import Dexie, { type EntityTable } from 'dexie'
import type { SaveGame } from '../game/types'
import { saveGameSchema } from '../game/schemas'

export interface SaveRecord extends SaveGame {
  slot: number
}

const db = new Dexie('MiCarreraDB') as Dexie & { saves: EntityTable<SaveRecord, 'slot'> }
db.version(1).stores({ saves: 'slot, updatedAt' })

export async function saveCareer(slot: number, save: SaveGame): Promise<void> {
  const valid = saveGameSchema.parse(save)
  await db.saves.put({ ...valid, slot })
}

export async function loadCareer(slot: number): Promise<SaveGame | null> {
  const record = await db.saves.get(slot)
  if (!record) return null
  const { slot: _slot, ...save } = record
  return saveGameSchema.parse(save)
}

export async function listSaves(): Promise<SaveRecord[]> {
  return db.saves.orderBy('slot').toArray()
}

export async function deleteSave(slot: number): Promise<void> {
  await db.saves.delete(slot)
}
