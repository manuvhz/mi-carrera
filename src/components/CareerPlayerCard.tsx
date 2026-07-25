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
  const decisionsThisSeason = player.eventHistory.filter((entry) => entry.season === player.season && !entry.eventId.startsWith('training-')).length
  const trainedThisSeason = player.activeFlags.some((flag) => flag.endsWith(`:season:${player.season}`) && (flag.startsWith('minigame:') || flag.startsWith('training:')))
  const style = { '--club-primary': club.colors[0], '--club-secondary': club.colors[1] } as CSSProperties

  return <section className="player-card player-hud" style={style} aria-label="HUD de carrera del jugador">
    <header className="player-card-head">
      <div className="club-crest-wrap"><img src={clubCrestUrl(club)} alt={`Escudo de ${club.name}`} /></div>
      <div className="player-identity">
        <div className="player-age"><strong>{player.age}</strong><span>EDAD</span></div>
        <div><p>{club.shortName.toUpperCase()} · {player.clubRole.toUpperCase()}</p><h1>{displayName}</h1>
          <small>{POSITION_CODES[player.primaryPosition] ?? player.primaryPosition.slice(0, 3).toUpperCase()} · Nº {player.favoriteNumber} · {player.preferredFoot}</small>
        </div>
      </div>
      <div className="hud-season"><span>TEMPORADA</span><strong>{String(player.season).padStart(2, '0')}</strong><small>{club.league}</small></div>
    </header>

    <div className="player-main-stats">
      <CardStat value={player.stats.goals} label="Goles" accent />
      <CardStat value={player.stats.assists} label="Asistencias" />
      <CardStat value={player.stats.matches} label="Partidos" />
      <CardStat value={player.stats.trophies} label="Títulos" />
    </div>

    <div className="hud-status-line">
      <div className="hud-role"><span>ESTADO</span><strong>{clubStatus}</strong></div>
      <div className="hud-vitals" aria-label="Atributos esenciales">
        <span>TÉC <strong>{player.stats.technique}</strong></span>
        <span>FÍS <strong>{player.stats.fitness}</strong></span>
        <span>CON <strong>{player.stats.confidence}</strong></span>
      </div>
      <div className="hud-mission"><span>OBJETIVO DE TEMPORADA</span><strong>{Math.min(decisionsThisSeason, 2)}/2 decisiones · {trainedThisSeason ? 'entrenamiento listo' : 'falta entrenar'}</strong></div>
    </div>

    <details className="hud-details">
      <summary><span>Ver ficha completa</span><small>Atributos, fama y valor de carrera</small></summary>
      <div className="player-attributes">
        {(Object.keys(ATTRIBUTE_LABELS) as Array<keyof typeof ATTRIBUTE_LABELS>).map((key) => <div key={key}>
          <strong>{player.stats[key]}</strong><span>{ATTRIBUTE_LABELS[key]}</span><i><b style={{ width: `${player.stats[key]}%` }} /></i>
        </div>)}
      </div>
      <div className="player-career-strip">
        <div><strong>{player.stats.reputation}</strong><span>FAMA</span></div>
        <div><strong>US$ {player.stats.finances * 100}</strong><span>VALOR DE CARRERA</span></div>
        <div><strong>{club.city}</strong><span>SEDE DEL CLUB</span></div>
      </div>
    </details>
  </section>
}

function CardStat({ value, label, accent = false }: { value: number; label: string; accent?: boolean }) {
  return <div className={accent ? 'accent' : ''}><strong>{value}</strong><span>{label}</span></div>
}
