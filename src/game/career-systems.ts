import type { CareerPlayer, CareerRival, PlayerStats } from './types'

export const PRIMARY_ATTRIBUTE_KEYS = ['technique', 'fitness', 'talent', 'confidence'] as const

export function playerOverall(playerOrStats: CareerPlayer | PlayerStats) {
  const stats = 'stats' in playerOrStats ? playerOrStats.stats : playerOrStats
  return Math.min(99, Math.round(PRIMARY_ATTRIBUTE_KEYS.reduce((sum, key) => sum + stats[key], 0) / PRIMARY_ATTRIBUTE_KEYS.length))
}

export function playerForm(player: CareerPlayer) {
  return player.stats.form ?? 50
}

export function formPresentation(form: number) {
  if (form >= 82) return { arrows: '↑↑', label: 'En llamas', tone: 'hot' }
  if (form >= 64) return { arrows: '↑', label: 'En alza', tone: 'good' }
  if (form >= 42) return { arrows: '→', label: 'Estable', tone: 'steady' }
  if (form >= 24) return { arrows: '↓', label: 'En baja', tone: 'low' }
  return { arrows: '↓↓', label: 'Sin confianza', tone: 'cold' }
}

export function formatCareerMoney(thousands: number, compact = false) {
  const dollars = Math.max(0, thousands) * 1000
  if (compact && dollars >= 1_000_000) return `US$ ${(dollars / 1_000_000).toFixed(dollars >= 10_000_000 ? 0 : 1)}M`
  if (compact && dollars >= 1_000) return `US$ ${Math.round(dollars / 1000)}K`
  return `US$ ${Math.round(dollars).toLocaleString('es')}`
}

export function idolatryTier(value: number) {
  if (value >= 90) return 'Leyenda'
  if (value >= 72) return 'Ídolo'
  if (value >= 52) return 'Referente'
  if (value >= 30) return 'Querido'
  return 'Nuevo'
}

export function currentIdolatry(player: CareerPlayer) {
  if (!player.currentClubId) return 0
  return player.clubIdolatries?.[player.currentClubId] ?? 0
}

export function hasCareerItem(player: CareerPlayer, itemId: string) {
  return player.ownedItems?.includes(itemId) ?? false
}

export function retirementAgeFor(player: CareerPlayer) {
  return 38 + (hasCareerItem(player, 'personal-physio') ? 1 : 0) + (hasCareerItem(player, 'fitness-coach') ? 1 : 0)
}

export function careerProjection(player: CareerPlayer, leagueId: string) {
  const overall = playerOverall(player)
  const european = ['england', 'spain', 'italy', 'germany', 'france'].includes(leagueId)
  if (player.age < 16) return 'Semillero: gana el salto al primer equipo.'
  if (european && overall >= 84) return 'Élite mundial: Champions y Balón de Oro están al alcance.'
  if (european) return 'En el exterior: consolida tu lugar y busca las copas europeas.'
  if (overall >= 78 || player.stats.reputation >= 55) return 'Europa te sigue: los grandes pueden llamar al final del año.'
  if (overall >= 66) return 'Radar internacional: una gran temporada abre el exterior.'
  return 'Mercado local: primero conviértete en figura de tu liga.'
}

export function createCareerRival(seed: number, age: number): CareerRival {
  const names = ['Enzo Domínguez', 'Thiago Ferreira', 'Lucas Moretti', 'Iker Salvatierra', 'Noah Bennett', 'Matteo Ricci']
  const nicknames = ['El Príncipe', 'La Sombra', 'El Zurdo', 'El Pibe', 'El Artillero', 'El Diez']
  const index = Math.abs(seed) % names.length
  return { name: names[index], nickname: nicknames[(index + 2) % nicknames.length], age, currentClubId: null, goals: 0, assists: 0, matches: 0, trophies: 0, reputation: 3, nationalTeamCaps: 0 }
}
