export interface Club {
  id: string; name: string; city: string; country: string; division: number; prestige: number; economy: number
  academy: number; pressure: number; style: string; youthPatience: number; ambition: number; colors: [string, string]; rivalId: string
}

export const COUNTRIES = ['Ardania', 'Belvaria', 'Costaluz', 'Montelirio', 'Norvenda', 'Salmoria', 'Tirvania', 'Verdemar'] as const

export const LEAGUES = [
  { id: 'ard-1', name: 'Liga del Faro', country: 'Ardania', division: 1 }, { id: 'ard-2', name: 'Ascenso del Faro', country: 'Ardania', division: 2 },
  { id: 'bel-1', name: 'Corona Belvaria', country: 'Belvaria', division: 1 }, { id: 'bel-2', name: 'Liga de Plata', country: 'Belvaria', division: 2 },
  { id: 'cos-1', name: 'Primera del Sol', country: 'Costaluz', division: 1 }, { id: 'cos-2', name: 'Ruta Costera', country: 'Costaluz', division: 2 },
  { id: 'mon-1', name: 'Cumbre Nacional', country: 'Montelirio', division: 1 }, { id: 'mon-2', name: 'Liga del Valle', country: 'Montelirio', division: 2 },
  { id: 'nor-1', name: 'Liga Boreal', country: 'Norvenda', division: 1 }, { id: 'nor-2', name: 'Desafío Norte', country: 'Norvenda', division: 2 },
  { id: 'sal-1', name: 'Liga Salmoria', country: 'Salmoria', division: 1 }, { id: 'continental', name: 'Copa de los Horizontes', country: 'Continental', division: 1 },
] as const

const clubNames = [
  ['Aurora del Sur', 'Círculo Cobalto', 'Estrella de Bruma', 'Unión del Puerto', 'Atlético Lumbre', 'Deportivo Mirador', 'Ferroviarios del Este', 'Racing del Sauce', 'Academia Centella', 'Real Horizonte'],
  ['Corona Gris', 'Sporting Edel', 'Lobos de Arken', 'Unión Velaria', 'Atlético Niebla', 'Náutico Bren', 'Ciudad Orbel', 'Mineros de Liria', 'Deportivo Alba', 'Guardia del Norte'],
  ['Bahía Dorada', 'Marineros de Sol', 'Unión Coral', 'Atlético Marea', 'Deportivo Candela', 'Palmeras FC', 'Estrella Salina', 'Río Claro', 'Juventud Perla', 'Costa Firme'],
  ['Cumbre Azul', 'Cóndores de Lirio', 'Unión Serrana', 'Deportivo Granito', 'Atlético Altura', 'Valle Rojo', 'Real Pinar', 'Academia Nevada', 'Racing del Paso', 'Montesol FC'],
  ['Faro Boreal', 'Cuervos de Noren', 'Atlético Glaciar', 'Puerto Blanco', 'Unión del Pino', 'Deportivo Tundra', 'Lagos del Norte', 'Ciudad Umbral', 'Estrella Polar', 'Racing Fiordo'],
  ['Salmoria Central', 'Atlético Azafrán', 'Unión del Olivo', 'Deportivo Arcilla', 'Estrella Carmesí', 'Real Salina', 'Ciudad Mosaico', 'Racing del Oasis', 'Juventud Siroco', 'Academia Duna'],
  ['Tirvania Unido', 'Dragones de Tiria', 'Atlético Rubí', 'Deportivo Puente', 'Unión Imperial', 'Racing Violeta', 'Ciudad Tesela', 'Estrella del Este', 'Juventud Ámbar', 'Academia Trigal'],
  ['Verdemar FC', 'Atlético Manglar', 'Deportivo Cascada', 'Unión Esmeralda', 'Racing Laguna', 'Ciudad Bambú', 'Estrella Selva', 'Náutico Verde', 'Juventud Ceiba', 'Academia Rocío'],
] as const
const cities = ['Puerto Cobalto', 'Altavista', 'Brumaria', 'Luzmar', 'Valdora', 'San Cierzo', 'Miracosta', 'Puente Alto', 'Río Sereno', 'Monte Claro']
const styles = ['posesión paciente', 'presión intensa', 'transición vertical', 'juego por bandas', 'defensa compacta']
const colors: [string, string][] = [['#1d6d47', '#f0d27c'], ['#193c78', '#ece8db'], ['#7d2430', '#e6c469'], ['#492a67', '#7bd3a7'], ['#bb6b2d', '#17241d']]

export const CLUBS: Club[] = clubNames.flatMap((names, countryIndex) => names.map((name, index) => ({
  id: `club-${countryIndex + 1}-${index + 1}`, name, city: cities[index], country: COUNTRIES[countryIndex], division: index < 6 ? 1 : 2,
  prestige: 35 + ((countryIndex * 11 + index * 7) % 61), economy: 30 + ((countryIndex * 13 + index * 9) % 66), academy: 35 + ((countryIndex * 17 + index * 5) % 61),
  pressure: 25 + ((countryIndex * 19 + index * 6) % 71), style: styles[(countryIndex + index) % styles.length], youthPatience: 25 + ((countryIndex * 7 + index * 11) % 71),
  ambition: 30 + ((countryIndex * 23 + index * 3) % 66), colors: colors[(countryIndex + index) % colors.length], rivalId: `club-${countryIndex + 1}-${((index + 1) % 10) + 1}`,
})))

export const COMPETITIONS = ['Copa de los Horizontes', 'Copa del Faro', 'Trofeo de las Cumbres', 'Supercopa Continental', 'Torneo Juvenil Semilla'] as const
