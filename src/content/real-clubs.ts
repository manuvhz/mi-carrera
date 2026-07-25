import type { CareerPlayer } from '../game/types'

export interface RealClub {
  id: string
  name: string
  shortName: string
  city: string
  league: string
  crest: string
  colors: [string, string]
  source: string
  license: string
}

export const REAL_CLUBS: RealClub[] = [
  { id: 'gimnasia-jujuy', name: 'Gimnasia y Esgrima de Jujuy', shortName: 'Gimnasia de Jujuy', city: 'San Salvador de Jujuy', league: 'Primera Nacional', crest: 'clubs/gimnasia-jujuy.svg', colors: ['#43a9ea', '#ffffff'], source: 'https://commons.wikimedia.org/wiki/File:Gimnasia_y_Esgrima_de_Jujuy_1995.svg', license: 'CC0 1.0' },
  { id: 'boca-juniors', name: 'Boca Juniors', shortName: 'Boca', city: 'Buenos Aires', league: 'Primera División', crest: 'clubs/boca-juniors.png', colors: ['#0d2c73', '#f5c842'], source: 'https://commons.wikimedia.org/wiki/File:Escudo-Boca_Juniors.png', license: 'CC BY-SA 4.0' },
  { id: 'river-plate', name: 'River Plate', shortName: 'River', city: 'Buenos Aires', league: 'Primera División', crest: 'clubs/river-plate.svg', colors: ['#e31f2b', '#ffffff'], source: 'https://commons.wikimedia.org/wiki/File:River_Plate_logo.svg', license: 'Dominio público (logotipo simple)' },
  { id: 'racing-club', name: 'Racing Club', shortName: 'Racing', city: 'Avellaneda', league: 'Primera División', crest: 'clubs/racing-club.svg', colors: ['#75c9ee', '#ffffff'], source: 'https://commons.wikimedia.org/wiki/File:Escudo_de_Racing_Club.svg', license: 'Dominio público (logotipo simple)' },
  { id: 'independiente', name: 'Independiente', shortName: 'Independiente', city: 'Avellaneda', league: 'Primera División', crest: 'clubs/independiente.svg', colors: ['#d91f2b', '#ffffff'], source: 'https://commons.wikimedia.org/wiki/File:Escudo_del_Club_Atl%C3%A9tico_Independiente.svg', license: 'Dominio público (logotipo simple)' },
  { id: 'san-lorenzo', name: 'San Lorenzo de Almagro', shortName: 'San Lorenzo', city: 'Buenos Aires', league: 'Primera División', crest: 'clubs/san-lorenzo.png', colors: ['#173b7a', '#d52232'], source: 'https://commons.wikimedia.org/wiki/File:Escudo_del_Club_Atl%C3%A9tico_San_Lorenzo_de_Almagro.svg', license: 'Dominio público (logotipo simple)' },
  { id: 'velez-sarsfield', name: 'Vélez Sarsfield', shortName: 'Vélez', city: 'Buenos Aires', league: 'Primera División', crest: 'clubs/velez-sarsfield.svg', colors: ['#1d4f9f', '#ffffff'], source: 'https://commons.wikimedia.org/wiki/File:Escudo_del_Club_Atl%C3%A9tico_V%C3%A9lez_Sarsfield.svg', license: 'Dominio público (logotipo simple)' },
  { id: 'rosario-central', name: 'Rosario Central', shortName: 'Rosario Central', city: 'Rosario', league: 'Primera División', crest: 'clubs/rosario-central.svg', colors: ['#1b4aa0', '#f1c629'], source: 'https://commons.wikimedia.org/wiki/File:Escudo_del_Club_Atl%C3%A9tico_Rosario_Central.svg', license: 'Dominio público (logotipo simple)' },
  { id: 'newells-old-boys', name: "Newell's Old Boys", shortName: "Newell's", city: 'Rosario', league: 'Primera División', crest: 'clubs/newells-old-boys.png', colors: ['#d82332', '#171717'], source: 'https://commons.wikimedia.org/wiki/File:CA_Newell%E2%80%99s_Old_Boys.svg', license: 'Dominio público (logotipo simple)' },
  { id: 'estudiantes-lp', name: 'Estudiantes de La Plata', shortName: 'Estudiantes', city: 'La Plata', league: 'Primera División', crest: 'clubs/estudiantes-lp.svg', colors: ['#d8202f', '#ffffff'], source: 'https://commons.wikimedia.org/wiki/File:Escudo_del_Club_Estudiantes_de_La_Plata.svg', license: 'Dominio público (logotipo simple)' },
  { id: 'talleres', name: 'Talleres de Córdoba', shortName: 'Talleres', city: 'Córdoba', league: 'Primera División', crest: 'clubs/talleres.svg', colors: ['#162f70', '#ffffff'], source: 'https://commons.wikimedia.org/wiki/File:Escudo_Talleres_2015.svg', license: 'Dominio público (logotipo simple)' },
  { id: 'belgrano', name: 'Belgrano de Córdoba', shortName: 'Belgrano', city: 'Córdoba', league: 'Primera División', crest: 'clubs/belgrano.svg', colors: ['#60bce6', '#151515'], source: 'https://commons.wikimedia.org/wiki/File:Escudo_del_Club_Atl%C3%A9tico_Belgrano.svg', license: 'Dominio público (logotipo simple)' },
]

export const DEFAULT_CLUB_ID = 'gimnasia-jujuy'

export function clubCrestUrl(club: RealClub) {
  return `${import.meta.env.BASE_URL}${club.crest}`
}

export function clubById(id?: string | null) {
  return REAL_CLUBS.find((club) => club.id === id) ?? REAL_CLUBS[0]
}

export function clubForPlayer(player: CareerPlayer) {
  return REAL_CLUBS.find((club) => club.id === player.favoriteClubId || club.id === player.currentClubId || club.name === player.currentClubId) ?? clubById(player.favoriteClubId)
}
