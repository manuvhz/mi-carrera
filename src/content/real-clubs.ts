import type { CareerPlayer } from '../game/types'

export type FootballRegionId = 'argentina' | 'england' | 'spain' | 'italy' | 'germany' | 'france'

export interface RealClub {
  id: string
  name: string
  shortName: string
  city: string
  country: string
  leagueId: FootballRegionId
  league: string
  crest: string
  colors: [string, string]
  prestige: number
  academy: number
  source: string
  license: string
}

export const FOOTBALL_REGIONS: Array<{ id: FootballRegionId; name: string; league: string; flag: string }> = [
  { id: 'argentina', name: 'Argentina', league: 'Liga Argentina', flag: '🇦🇷' },
  { id: 'england', name: 'Inglaterra', league: 'Premier League', flag: '🏴' },
  { id: 'spain', name: 'España', league: 'LALIGA', flag: '🇪🇸' },
  { id: 'italy', name: 'Italia', league: 'Serie A', flag: '🇮🇹' },
  { id: 'germany', name: 'Alemania', league: 'Bundesliga', flag: '🇩🇪' },
  { id: 'france', name: 'Francia', league: 'Ligue 1', flag: '🇫🇷' },
]

const IDENTIFICATION_LICENSE = 'Marca de su titular · uso identificativo en proyecto de fans'
const crestSource = (id: number) => `https://crests.football-data.org/${id}.png`

export const REAL_CLUBS: RealClub[] = [
  { id: 'gimnasia-jujuy', name: 'Gimnasia y Esgrima de Jujuy', shortName: 'Gimnasia de Jujuy', city: 'San Salvador de Jujuy', country: 'Argentina', leagueId: 'argentina', league: 'Primera Nacional', crest: 'clubs/gimnasia-jujuy.svg', colors: ['#43a9ea', '#ffffff'], prestige: 58, academy: 72, source: 'https://commons.wikimedia.org/wiki/File:Gimnasia_y_Esgrima_de_Jujuy_1995.svg', license: 'CC0 1.0' },
  { id: 'boca-juniors', name: 'Boca Juniors', shortName: 'Boca', city: 'Buenos Aires', country: 'Argentina', leagueId: 'argentina', league: 'Primera División', crest: 'clubs/boca-juniors.png', colors: ['#0d2c73', '#f5c842'], prestige: 87, academy: 88, source: 'https://commons.wikimedia.org/wiki/File:Escudo-Boca_Juniors.png', license: 'CC BY-SA 4.0' },
  { id: 'river-plate', name: 'River Plate', shortName: 'River', city: 'Buenos Aires', country: 'Argentina', leagueId: 'argentina', league: 'Primera División', crest: 'clubs/river-plate.svg', colors: ['#e31f2b', '#ffffff'], prestige: 89, academy: 94, source: 'https://commons.wikimedia.org/wiki/File:River_Plate_logo.svg', license: 'Dominio público (logotipo simple)' },
  { id: 'racing-club', name: 'Racing Club', shortName: 'Racing', city: 'Avellaneda', country: 'Argentina', leagueId: 'argentina', league: 'Primera División', crest: 'clubs/racing-club.svg', colors: ['#75c9ee', '#ffffff'], prestige: 81, academy: 82, source: 'https://commons.wikimedia.org/wiki/File:Escudo_de_Racing_Club.svg', license: 'Dominio público (logotipo simple)' },
  { id: 'independiente', name: 'Independiente', shortName: 'Independiente', city: 'Avellaneda', country: 'Argentina', leagueId: 'argentina', league: 'Primera División', crest: 'clubs/independiente.svg', colors: ['#d91f2b', '#ffffff'], prestige: 81, academy: 81, source: 'https://commons.wikimedia.org/wiki/File:Escudo_del_Club_Atl%C3%A9tico_Independiente.svg', license: 'Dominio público (logotipo simple)' },
  { id: 'san-lorenzo', name: 'San Lorenzo de Almagro', shortName: 'San Lorenzo', city: 'Buenos Aires', country: 'Argentina', leagueId: 'argentina', league: 'Primera División', crest: 'clubs/san-lorenzo.png', colors: ['#173b7a', '#d52232'], prestige: 78, academy: 78, source: 'https://commons.wikimedia.org/wiki/File:Escudo_del_Club_Atl%C3%A9tico_San_Lorenzo_de_Almagro.svg', license: 'Dominio público (logotipo simple)' },
  { id: 'velez-sarsfield', name: 'Vélez Sarsfield', shortName: 'Vélez', city: 'Buenos Aires', country: 'Argentina', leagueId: 'argentina', league: 'Primera División', crest: 'clubs/velez-sarsfield.svg', colors: ['#1d4f9f', '#ffffff'], prestige: 76, academy: 90, source: 'https://commons.wikimedia.org/wiki/File:Escudo_del_Club_Atl%C3%A9tico_V%C3%A9lez_Sarsfield.svg', license: 'Dominio público (logotipo simple)' },
  { id: 'rosario-central', name: 'Rosario Central', shortName: 'Rosario Central', city: 'Rosario', country: 'Argentina', leagueId: 'argentina', league: 'Primera División', crest: 'clubs/rosario-central.svg', colors: ['#1b4aa0', '#f1c629'], prestige: 76, academy: 79, source: 'https://commons.wikimedia.org/wiki/File:Escudo_del_Club_Atl%C3%A9tico_Rosario_Central.svg', license: 'Dominio público (logotipo simple)' },
  { id: 'newells-old-boys', name: "Newell's Old Boys", shortName: "Newell's", city: 'Rosario', country: 'Argentina', leagueId: 'argentina', league: 'Primera División', crest: 'clubs/newells-old-boys.png', colors: ['#d82332', '#171717'], prestige: 75, academy: 86, source: 'https://commons.wikimedia.org/wiki/File:CA_Newell%E2%80%99s_Old_Boys.svg', license: 'Dominio público (logotipo simple)' },
  { id: 'estudiantes-lp', name: 'Estudiantes de La Plata', shortName: 'Estudiantes', city: 'La Plata', country: 'Argentina', leagueId: 'argentina', league: 'Primera División', crest: 'clubs/estudiantes-lp.svg', colors: ['#d8202f', '#ffffff'], prestige: 80, academy: 84, source: 'https://commons.wikimedia.org/wiki/File:Escudo_del_Club_Estudiantes_de_La_Plata.svg', license: 'Dominio público (logotipo simple)' },
  { id: 'talleres', name: 'Talleres de Córdoba', shortName: 'Talleres', city: 'Córdoba', country: 'Argentina', leagueId: 'argentina', league: 'Primera División', crest: 'clubs/talleres.svg', colors: ['#162f70', '#ffffff'], prestige: 75, academy: 81, source: 'https://commons.wikimedia.org/wiki/File:Escudo_Talleres_2015.svg', license: 'Dominio público (logotipo simple)' },
  { id: 'belgrano', name: 'Belgrano de Córdoba', shortName: 'Belgrano', city: 'Córdoba', country: 'Argentina', leagueId: 'argentina', league: 'Primera División', crest: 'clubs/belgrano.svg', colors: ['#60bce6', '#151515'], prestige: 72, academy: 78, source: 'https://commons.wikimedia.org/wiki/File:Escudo_del_Club_Atl%C3%A9tico_Belgrano.svg', license: 'Dominio público (logotipo simple)' },

  { id: 'arsenal', name: 'Arsenal', shortName: 'Arsenal', city: 'Londres', country: 'Inglaterra', leagueId: 'england', league: 'Premier League', crest: 'clubs/arsenal.png', colors: ['#db0007', '#ffffff'], prestige: 93, academy: 91, source: crestSource(57), license: IDENTIFICATION_LICENSE },
  { id: 'chelsea', name: 'Chelsea', shortName: 'Chelsea', city: 'Londres', country: 'Inglaterra', leagueId: 'england', league: 'Premier League', crest: 'clubs/chelsea.png', colors: ['#034694', '#ffffff'], prestige: 89, academy: 94, source: crestSource(61), license: IDENTIFICATION_LICENSE },
  { id: 'liverpool', name: 'Liverpool', shortName: 'Liverpool', city: 'Liverpool', country: 'Inglaterra', leagueId: 'england', league: 'Premier League', crest: 'clubs/liverpool.png', colors: ['#c8102e', '#00b2a9'], prestige: 96, academy: 90, source: crestSource(64), license: IDENTIFICATION_LICENSE },
  { id: 'manchester-city', name: 'Manchester City', shortName: 'Man. City', city: 'Mánchester', country: 'Inglaterra', leagueId: 'england', league: 'Premier League', crest: 'clubs/manchester-city.png', colors: ['#6cabdd', '#ffffff'], prestige: 96, academy: 92, source: crestSource(65), license: IDENTIFICATION_LICENSE },
  { id: 'manchester-united', name: 'Manchester United', shortName: 'Man. United', city: 'Mánchester', country: 'Inglaterra', leagueId: 'england', league: 'Premier League', crest: 'clubs/manchester-united.png', colors: ['#da291c', '#fbe122'], prestige: 92, academy: 93, source: crestSource(66), license: IDENTIFICATION_LICENSE },
  { id: 'tottenham', name: 'Tottenham Hotspur', shortName: 'Tottenham', city: 'Londres', country: 'Inglaterra', leagueId: 'england', league: 'Premier League', crest: 'clubs/tottenham.png', colors: ['#132257', '#ffffff'], prestige: 86, academy: 87, source: crestSource(73), license: IDENTIFICATION_LICENSE },

  { id: 'real-madrid', name: 'Real Madrid', shortName: 'Real Madrid', city: 'Madrid', country: 'España', leagueId: 'spain', league: 'LALIGA', crest: 'clubs/real-madrid.png', colors: ['#ffffff', '#febe10'], prestige: 99, academy: 94, source: crestSource(86), license: IDENTIFICATION_LICENSE },
  { id: 'barcelona', name: 'FC Barcelona', shortName: 'Barcelona', city: 'Barcelona', country: 'España', leagueId: 'spain', league: 'LALIGA', crest: 'clubs/barcelona.png', colors: ['#004d98', '#a50044'], prestige: 98, academy: 99, source: crestSource(81), license: IDENTIFICATION_LICENSE },
  { id: 'atletico-madrid', name: 'Atlético de Madrid', shortName: 'Atlético', city: 'Madrid', country: 'España', leagueId: 'spain', league: 'LALIGA', crest: 'clubs/atletico-madrid.png', colors: ['#cb3524', '#272e61'], prestige: 91, academy: 88, source: crestSource(78), license: IDENTIFICATION_LICENSE },
  { id: 'athletic-bilbao', name: 'Athletic Club', shortName: 'Athletic', city: 'Bilbao', country: 'España', leagueId: 'spain', league: 'LALIGA', crest: 'clubs/athletic-bilbao.png', colors: ['#ee2523', '#ffffff'], prestige: 83, academy: 95, source: crestSource(77), license: IDENTIFICATION_LICENSE },
  { id: 'sevilla', name: 'Sevilla FC', shortName: 'Sevilla', city: 'Sevilla', country: 'España', leagueId: 'spain', league: 'LALIGA', crest: 'clubs/sevilla.png', colors: ['#d71920', '#ffffff'], prestige: 79, academy: 84, source: crestSource(559), license: IDENTIFICATION_LICENSE },
  { id: 'valencia', name: 'Valencia CF', shortName: 'Valencia', city: 'Valencia', country: 'España', leagueId: 'spain', league: 'LALIGA', crest: 'clubs/valencia.png', colors: ['#f7a600', '#111111'], prestige: 79, academy: 88, source: crestSource(95), license: IDENTIFICATION_LICENSE },

  { id: 'inter-milan', name: 'Inter de Milán', shortName: 'Inter', city: 'Milán', country: 'Italia', leagueId: 'italy', league: 'Serie A', crest: 'clubs/inter-milan.png', colors: ['#00529f', '#000000'], prestige: 94, academy: 86, source: crestSource(108), license: IDENTIFICATION_LICENSE },
  { id: 'ac-milan', name: 'AC Milan', shortName: 'Milan', city: 'Milán', country: 'Italia', leagueId: 'italy', league: 'Serie A', crest: 'clubs/ac-milan.png', colors: ['#fb090b', '#000000'], prestige: 93, academy: 88, source: crestSource(98), license: IDENTIFICATION_LICENSE },
  { id: 'juventus', name: 'Juventus', shortName: 'Juventus', city: 'Turín', country: 'Italia', leagueId: 'italy', league: 'Serie A', crest: 'clubs/juventus.png', colors: ['#ffffff', '#000000'], prestige: 93, academy: 86, source: crestSource(109), license: IDENTIFICATION_LICENSE },
  { id: 'napoli', name: 'SSC Napoli', shortName: 'Napoli', city: 'Nápoles', country: 'Italia', leagueId: 'italy', league: 'Serie A', crest: 'clubs/napoli.png', colors: ['#12a0d7', '#ffffff'], prestige: 89, academy: 82, source: crestSource(113), license: IDENTIFICATION_LICENSE },
  { id: 'roma', name: 'AS Roma', shortName: 'Roma', city: 'Roma', country: 'Italia', leagueId: 'italy', league: 'Serie A', crest: 'clubs/roma.png', colors: ['#8e1f2f', '#f0bc42'], prestige: 86, academy: 87, source: crestSource(100), license: IDENTIFICATION_LICENSE },
  { id: 'atalanta', name: 'Atalanta BC', shortName: 'Atalanta', city: 'Bérgamo', country: 'Italia', leagueId: 'italy', league: 'Serie A', crest: 'clubs/atalanta.png', colors: ['#1e71b8', '#000000'], prestige: 84, academy: 94, source: crestSource(102), license: IDENTIFICATION_LICENSE },

  { id: 'bayern-munich', name: 'FC Bayern München', shortName: 'Bayern', city: 'Múnich', country: 'Alemania', leagueId: 'germany', league: 'Bundesliga', crest: 'clubs/bayern-munich.png', colors: ['#dc052d', '#0066b2'], prestige: 98, academy: 90, source: crestSource(5), license: IDENTIFICATION_LICENSE },
  { id: 'borussia-dortmund', name: 'Borussia Dortmund', shortName: 'Dortmund', city: 'Dortmund', country: 'Alemania', leagueId: 'germany', league: 'Bundesliga', crest: 'clubs/borussia-dortmund.png', colors: ['#fde100', '#000000'], prestige: 92, academy: 96, source: crestSource(4), license: IDENTIFICATION_LICENSE },
  { id: 'bayer-leverkusen', name: 'Bayer 04 Leverkusen', shortName: 'Leverkusen', city: 'Leverkusen', country: 'Alemania', leagueId: 'germany', league: 'Bundesliga', crest: 'clubs/bayer-leverkusen.png', colors: ['#e32221', '#111111'], prestige: 89, academy: 89, source: crestSource(3), license: IDENTIFICATION_LICENSE },
  { id: 'rb-leipzig', name: 'RB Leipzig', shortName: 'RB Leipzig', city: 'Leipzig', country: 'Alemania', leagueId: 'germany', league: 'Bundesliga', crest: 'clubs/rb-leipzig.png', colors: ['#dd0741', '#ffffff'], prestige: 85, academy: 91, source: crestSource(721), license: IDENTIFICATION_LICENSE },
  { id: 'eintracht-frankfurt', name: 'Eintracht Frankfurt', shortName: 'Frankfurt', city: 'Fráncfort', country: 'Alemania', leagueId: 'germany', league: 'Bundesliga', crest: 'clubs/eintracht-frankfurt.png', colors: ['#e1000f', '#000000'], prestige: 81, academy: 83, source: crestSource(19), license: IDENTIFICATION_LICENSE },
  { id: 'stuttgart', name: 'VfB Stuttgart', shortName: 'Stuttgart', city: 'Stuttgart', country: 'Alemania', leagueId: 'germany', league: 'Bundesliga', crest: 'clubs/stuttgart.png', colors: ['#e32219', '#ffffff'], prestige: 80, academy: 90, source: crestSource(10), license: IDENTIFICATION_LICENSE },

  { id: 'psg', name: 'Paris Saint-Germain', shortName: 'PSG', city: 'París', country: 'Francia', leagueId: 'france', league: 'Ligue 1', crest: 'clubs/psg.png', colors: ['#004170', '#da291c'], prestige: 97, academy: 92, source: crestSource(524), license: IDENTIFICATION_LICENSE },
  { id: 'marseille', name: 'Olympique de Marseille', shortName: 'Marseille', city: 'Marsella', country: 'Francia', leagueId: 'france', league: 'Ligue 1', crest: 'clubs/marseille.png', colors: ['#2faee0', '#ffffff'], prestige: 86, academy: 84, source: crestSource(516), license: IDENTIFICATION_LICENSE },
  { id: 'lyon', name: 'Olympique Lyonnais', shortName: 'Lyon', city: 'Lyon', country: 'Francia', leagueId: 'france', league: 'Ligue 1', crest: 'clubs/lyon.png', colors: ['#0046a8', '#d0021b'], prestige: 82, academy: 96, source: crestSource(523), license: IDENTIFICATION_LICENSE },
  { id: 'monaco', name: 'AS Monaco', shortName: 'Monaco', city: 'Mónaco', country: 'Francia', leagueId: 'france', league: 'Ligue 1', crest: 'clubs/monaco.png', colors: ['#e2001a', '#ffffff'], prestige: 87, academy: 95, source: crestSource(548), license: IDENTIFICATION_LICENSE },
  { id: 'lille', name: 'LOSC Lille', shortName: 'Lille', city: 'Lille', country: 'Francia', leagueId: 'france', league: 'Ligue 1', crest: 'clubs/lille.png', colors: ['#d7192d', '#1f3c8e'], prestige: 82, academy: 88, source: crestSource(521), license: IDENTIFICATION_LICENSE },
  { id: 'nice', name: 'OGC Nice', shortName: 'Nice', city: 'Niza', country: 'Francia', leagueId: 'france', league: 'Ligue 1', crest: 'clubs/nice.png', colors: ['#d71920', '#000000'], prestige: 78, academy: 86, source: crestSource(522), license: IDENTIFICATION_LICENSE },
]

export const DEFAULT_CLUB_ID = 'gimnasia-jujuy'

export function clubCrestUrl(club: RealClub) {
  return club.crest.startsWith('http') ? club.crest : `${import.meta.env.BASE_URL}${club.crest}`
}

export function clubById(id?: string | null) {
  return REAL_CLUBS.find((club) => club.id === id || club.name === id) ?? REAL_CLUBS[0]
}

export function currentClubForPlayer(player: CareerPlayer) {
  if (!player.currentClubId) return null
  return REAL_CLUBS.find((club) => club.id === player.currentClubId || club.name === player.currentClubId) ?? null
}

export function clubForPlayer(player: CareerPlayer) {
  return currentClubForPlayer(player) ?? clubById(player.favoriteClubId)
}

export function clubsInRegion(regionId: FootballRegionId) {
  return REAL_CLUBS.filter((club) => club.leagueId === regionId)
}
