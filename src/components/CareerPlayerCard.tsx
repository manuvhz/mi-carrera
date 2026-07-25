import type { CSSProperties } from 'react'
import { clubCrestUrl, clubForPlayer } from '../content/real-clubs'
import type { CareerPlayer } from '../game/types'

const POSITION_CODES: Record<string, string> = {
  Portero: 'ARQ', Defensa: 'DEF', Mediocampista: 'MED', Extremo: 'EXT', Delantero: 'DEL',
}

const ATTRIBUTE_LABELS = {
  technique: 'Técnica', fitness: 'Físico', talent: 'Talento', discipline: 'Disciplina', resilience: 'Resistencia',
} as const

export function CareerPlayerCard({ player }: { player: CareerPlayer }) {
  const club = clubForPlayer(player)
  const displayName = player.nickname || `${player.firstName} ${player.lastName}`
  const clubStatus = player.currentClubId ? player.clubRole : `Sueño: debutar en ${club.shortName}`
  const style = { '--club-primary': club.colors[0], '--club-secondary': club.colors[1] } as CSSProperties

  return <section className="player-card" style={style} aria-label="Ficha de carrera del jugador">
    <div className="player-card-head">
      <div className="player-identity">
        <div className="player-age"><strong>{player.age}</strong><span>EDAD</span></div>
        <div><h1>{displayName} <em>· {POSITION_CODES[player.primaryPosition] ?? player.primaryPosition.slice(0, 3).toUpperCase()} {player.favoriteNumber}</em></h1>
          <p>{club.name.toUpperCase()} · TEMPORADA {player.season} · {player.age} AÑOS</p>
          <small>{clubStatus}</small>
        </div>
      </div>
      <div className="club-crest-wrap"><img src={clubCrestUrl(club)} alt={`Escudo de ${club.name}`} /><span>{club.shortName}</span></div>
    </div>

    <div className="player-main-stats">
      <CardStat value={player.stats.goals} label="Goles" accent />
      <CardStat value={player.stats.assists} label="Asistencias" />
      <CardStat value={player.stats.matches} label="Partidos" />
      <CardStat value={player.stats.trophies} label="Títulos" />
    </div>

    <div className="player-attributes">
      {(Object.keys(ATTRIBUTE_LABELS) as Array<keyof typeof ATTRIBUTE_LABELS>).map((key) => <div key={key}>
        <strong>{player.stats[key]}</strong><span>{ATTRIBUTE_LABELS[key]}</span><i><b style={{ width: `${player.stats[key]}%` }} /></i>
      </div>)}
    </div>

    <div className="player-career-strip">
      <div><strong>{player.stats.reputation}</strong><span>FAMA</span></div>
      <div><strong>US$ {player.stats.finances * 100}</strong><span>VALOR DE CARRERA</span></div>
      <div><strong>{player.stats.goals}-{player.stats.assists}</strong><span>GOLES · ASISTENCIAS</span></div>
    </div>

    <div className="season-mission"><span>⚑ EL SEMILLERO</span><p><strong>Tu próxima misión:</strong> resuelve dos acontecimientos y entrena al menos una habilidad.</p><em>{club.league} · {club.city}</em></div>
  </section>
}

function CardStat({ value, label, accent = false }: { value: number; label: string; accent?: boolean }) {
  return <div className={accent ? 'accent' : ''}><strong>{value}</strong><span>{label}</span></div>
}
