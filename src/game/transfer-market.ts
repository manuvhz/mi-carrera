import { REAL_CLUBS, clubById, currentClubForPlayer, type RealClub } from '../content/real-clubs'
import { seededRandom } from './engine'
import { hasCareerItem, retirementAgeFor } from './career-systems'
import type { CareerPlayer } from './types'

export interface TransferOffer {
  club: RealClub
  role: string
  interest: string
  salary: number
  levelChange: number
}

export function playerMarketScore(player: CareerPlayer) {
  const sportingLevel = (player.stats.talent + player.stats.technique + player.stats.fitness + player.stats.confidence) / 4
  const production = Math.min(12, (player.stats.goals + player.stats.assists) / Math.max(1, player.stats.matches) * 35)
  const experience = Math.min(8, Math.max(0, player.age - 16) * .7)
  return Math.min(100, Math.round(sportingLevel * .64 + player.stats.reputation * .32 + production + experience))
}

export function transferOffersFor(player: CareerPlayer, seed: number, limit = 3): TransferOffer[] {
  if (player.age < 15 || player.age + 1 >= retirementAgeFor(player)) return []

  const currentClub = currentClubForPlayer(player)
  const academyClub = clubById(player.favoriteClubId)
  const score = playerMarketScore(player)
  const agentBonus = hasCareerItem(player, 'super-agent') ? 12 : 0
  const languageBonus = hasCareerItem(player, 'language-coach') ? 5 : 0
  const random = seededRandom(seed + player.season * 12_271 + player.age * 977)

  if (!currentClub) {
    const alternatives = REAL_CLUBS
      .filter((club) => club.id !== academyClub.id && club.leagueId === academyClub.leagueId)
      .map((club) => ({ club, order: club.academy + random() * 18 }))
      .sort((a, b) => b.order - a.order)
      .slice(0, Math.max(0, limit - 1))
      .map(({ club }) => buildOffer(club, academyClub.prestige, score, true, academyClub.leagueId, player))
    return [buildOffer(academyClub, academyClub.prestige, score, true, academyClub.leagueId, player), ...alternatives]
  }

  const maximumPrestige = Math.min(99, Math.max(score + 40 + agentBonus + languageBonus, currentClub.prestige - 6))
  const targetPrestige = Math.min(maximumPrestige, Math.max(currentClub.prestige + 9, score + 4))
  const ranked = REAL_CLUBS
    .filter((club) => club.id !== currentClub.id && club.prestige <= maximumPrestige)
    .map((club) => ({
      club,
      order: 100 - Math.abs(club.prestige - targetPrestige) * 2 + random() * 24 + (club.leagueId !== currentClub.leagueId ? 5 + languageBonus : 0) + agentBonus * .35,
    }))
    .sort((a, b) => b.order - a.order)

  const selected: RealClub[] = []
  for (const candidate of ranked) {
    if (selected.length >= limit) break
    const newCountry = !selected.some((club) => club.leagueId === candidate.club.leagueId)
    if (newCountry || ranked.length - selected.length <= limit) selected.push(candidate.club)
  }
  for (const candidate of ranked) {
    if (selected.length >= limit) break
    if (!selected.some((club) => club.id === candidate.club.id)) selected.push(candidate.club)
  }

  return selected.map((club) => buildOffer(club, currentClub.prestige, score, false, currentClub.leagueId, player))
}

function buildOffer(club: RealClub, currentPrestige: number, score: number, firstContract: boolean, currentLeagueId: string, player: CareerPlayer): TransferOffer {
  const levelChange = club.prestige - currentPrestige
  const role = firstContract
    ? club.academy >= 92 ? 'Joya de la cantera' : 'Proyecto del primer equipo'
    : levelChange >= 10 ? 'Rotación con proyección' : levelChange >= 3 ? 'Competir por la titularidad' : 'Pieza importante'
  const abroad = club.leagueId !== currentLeagueId
  const interest = firstContract
    ? 'Primer contrato profesional'
    : abroad ? 'Oferta del exterior' : levelChange >= 10 ? 'Salto de élite' : levelChange >= 3 ? 'Paso adelante' : levelChange <= -5 ? 'Más minutos' : 'Nuevo desafío'
  const agentMultiplier = hasCareerItem(player, 'super-agent') ? 1.18 : 1
  const salary = Math.round(((club.prestige * 780 + score * 460) * agentMultiplier) / 5) * 5
  return { club, role, interest, salary, levelChange }
}
