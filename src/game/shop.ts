import type { PlayerStats } from './types'

export type ShopCategory = 'staff' | 'development' | 'lifestyle' | 'legacy'

export interface ShopItem {
  id: string
  category: ShopCategory
  icon: string
  title: string
  cost: number
  description: string
  perk: string
  rewards?: Partial<Record<keyof PlayerStats, number>>
}

export const SHOP_ITEMS: ShopItem[] = [
  { id: 'smart-watch', category: 'development', icon: '⌚', title: 'Reloj de rendimiento', cost: 8, description: 'Datos de sueño y carga para empezar a cuidarte.', perk: 'Resistencia +1', rewards: { resilience: 1 } },
  { id: 'custom-boots', category: 'development', icon: '👟', title: 'Botines personalizados', cost: 12, description: 'Un ajuste hecho para tu golpeo y tus apoyos.', perk: 'Pegada +1 · Fama +1', rewards: { technique: 1, reputation: 1 } },
  { id: 'language-coach', category: 'development', icon: '🗣️', title: 'Profesor de idiomas', cost: 750, description: 'Adaptarte al exterior deja de ser una barrera.', perk: 'Mejores opciones internacionales', rewards: { confidence: 2 } },
  { id: 'video-analyst', category: 'development', icon: '💻', title: 'Analista de video', cost: 3500, description: 'Cada rival llega estudiado antes del partido.', perk: 'Visión +4 · Disciplina +2', rewards: { talent: 4, discipline: 2 } },
  { id: 'finishing-lab', category: 'development', icon: '🥅', title: 'Laboratorio de definición', cost: 5000, description: 'Tecnología de élite para entrenar el último toque.', perk: 'Pegada +4 · Mentalidad +2', rewards: { technique: 4, confidence: 2 } },
  { id: 'premium-chef', category: 'staff', icon: '👨‍🍳', title: 'Cocinero premium', cost: 8000, description: 'Comes como un rey y llegas con energía todo el año.', perk: 'Menos fatiga · forma más estable', rewards: { resilience: 3 } },
  { id: 'personal-physio', category: 'staff', icon: '🧑‍⚕️', title: 'Kinesiólogo personal', cost: 11000, description: 'Tu cuerpo recibe cuidado antes de que aparezca el dolor.', perk: 'Menor desgaste y riesgo físico', rewards: { resilience: 5 } },
  { id: 'sports-psychologist', category: 'staff', icon: '🧠', title: 'Psicólogo deportivo', cost: 9000, description: 'Una mala racha ya no gobierna toda la temporada.', perk: 'Mejor forma y mentalidad', rewards: { confidence: 5 } },
  { id: 'fitness-coach', category: 'staff', icon: '🏋️', title: 'Preparador físico', cost: 14000, description: 'El declive de las piernas llega más tarde.', perk: 'Velocidad +5 · carrera más larga', rewards: { fitness: 5 } },
  { id: 'super-agent', category: 'staff', icon: '🤝', title: 'Súper representante', cost: 12000, description: 'El mejor agente mueve ofertas y salarios de otro nivel.', perk: 'Más ofertas · mejores contratos', rewards: { reputation: 4 } },
  { id: 'sports-car', category: 'lifestyle', icon: '🏎️', title: 'Auto deportivo', cost: 500, description: 'Tu primer gusto cuando el fútbol empieza a pagar.', perk: 'Colección personal' },
  { id: 'own-house', category: 'lifestyle', icon: '🏠', title: 'Casa propia', cost: 1500, description: 'Un lugar para tu familia y tus recuerdos.', perk: 'Familia +4', rewards: { family: 4 } },
  { id: 'boot-collection', category: 'lifestyle', icon: '👞', title: 'Colección histórica de botines', cost: 2500, description: 'Guardas los pares de los partidos que cambiaron todo.', perk: 'Fama +3', rewards: { reputation: 3 } },
  { id: 'mansion', category: 'lifestyle', icon: '🏰', title: 'Mansión con cancha', cost: 6000, description: 'Tu propia cancha para entrenar y recibir a los tuyos.', perk: 'Barrio +4 · Mentalidad +2', rewards: { community: 4, confidence: 2 } },
  { id: 'yacht', category: 'lifestyle', icon: '🛥️', title: 'Yate', cost: 12000, description: 'Descanso de estrella entre temporadas.', perk: 'Colección personal' },
  { id: 'private-jet', category: 'lifestyle', icon: '✈️', title: 'Jet privado', cost: 28000, description: 'El mundo del fútbol queda a una escala de distancia.', perk: 'Colección personal' },
  { id: 'private-island', category: 'lifestyle', icon: '🏝️', title: 'Isla privada', cost: 48000, description: 'El lujo definitivo de una carrera extraordinaria.', perk: 'Trofeo de coleccionista' },
  { id: 'neighborhood-foundation', category: 'legacy', icon: '💙', title: 'Fundación en tu barrio', cost: 10000, description: 'Tu dinero vuelve al lugar donde empezó la historia.', perk: 'Barrio +12 · Fama +5', rewards: { community: 12, reputation: 5 } },
  { id: 'youth-academy', category: 'legacy', icon: '🌱', title: 'Academia para nuevos talentos', cost: 18000, description: 'Otros chicos encuentran la puerta que tú buscaste.', perk: 'Legado e idolatría', rewards: { community: 8, reputation: 7 } },
]

export function shopItemById(itemId: string) {
  return SHOP_ITEMS.find((item) => item.id === itemId)
}
