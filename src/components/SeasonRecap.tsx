import { useMemo, type CSSProperties } from 'react'
import { REAL_CLUBS, clubCrestUrl, clubForPlayer, type RealClub } from '../content/real-clubs'
import { simulateSeasonStats } from '../game/engine'
import { presentEventTitle } from '../game/presentation'
import type { CareerPlayer } from '../game/types'

interface SeasonRecapProps {
  player: CareerPlayer
  seed: number
  onAdvance: () => void
}

interface Standing {
  club: RealClub
  points: number
  played: number
  won: number
  drawn: number
  lost: number
}

export function SeasonRecap({ player, seed, onAdvance }: SeasonRecapProps) {
  const projected = useMemo(() => simulateSeasonStats(player, seed), [player, seed])
  const club = clubForPlayer(player)
  const seasonEntries = player.eventHistory.filter((entry) => entry.season === player.season)
  const trainingEntries = seasonEntries.filter((entry) => entry.eventId.startsWith('training-'))
  const storyEntries = seasonEntries.filter((entry) => !entry.eventId.startsWith('training-'))
  const seasonMatches = projected.stats.matches - player.stats.matches
  const seasonGoals = projected.stats.goals - player.stats.goals
  const seasonAssists = projected.stats.assists - player.stats.assists
  const contributions = seasonGoals + seasonAssists
  const rating = Math.min(9.9, 6.1 + contributions * .16 + player.stats.discipline * .008)
  const marketValue = Math.round((projected.stats.reputation * 18 + projected.stats.talent * 5 + player.stats.finances * 10) * 1000)
  const standings = useMemo(() => buildStandings(club, player, seed, contributions), [club, player, seed, contributions])
  const position = standings.findIndex((entry) => entry.club.id === club.id) + 1
  const mentor = player.narrativeCharacters[0]
  const rival = REAL_CLUBS[(REAL_CLUBS.findIndex((item) => item.id === club.id) + 1) % REAL_CLUBS.length]
  const rivalGoals = Math.abs(seed + player.season * 17) % Math.max(2, contributions + 2)
  const headline = headlineFor(player, contributions, position)
  const award = player.age < 13 ? 'Promesa del año' : player.age < 16 ? 'Revelación juvenil' : contributions >= 12 ? 'Figura de la temporada' : 'Jugador en ascenso'
  const recapStyle = { '--recap-primary': club.colors[0], '--recap-secondary': club.colors[1] } as CSSProperties

  const achievements = [
    { icon: '◈', title: award, text: `La temporada te reconoce como ${award.toLowerCase()} en esta partida.` },
    { icon: '⚑', title: 'Decisiones con memoria', text: `Resolviste ${storyEntries.length} acontecimientos que seguirán influyendo en tu carrera.` },
    { icon: '⚡', title: 'Trabajo de entrenamiento', text: trainingEntries.length ? `Completaste ${trainingEntries.length} retos interactivos y convertiste el esfuerzo en atributos.` : 'Todavía puedes hacer del entrenamiento una ventaja la próxima temporada.' },
    { icon: '★', title: 'Impacto ofensivo', text: `${seasonGoals} goles y ${seasonAssists} asistencias en ${seasonMatches} partidos simulados.` },
    { icon: '♟', title: 'Lugar en el equipo', text: `${player.clubRole}. El cuerpo técnico valora tu disciplina en ${player.stats.discipline}/100.` },
    { icon: '●', title: 'El nombre empieza a circular', text: `Tu reputación proyectada termina en ${projected.stats.reputation}/100.` },
    ...storyEntries.slice(-3).map((entry) => ({ icon: '✦', title: presentEventTitle(entry.title), text: entry.result })),
  ]

  return <main className="season-page" style={recapStyle}>
    <section className="recap-hero">
      <div className="recap-hero-top"><span>RESUMEN DE TEMPORADA</span><strong>{player.age < 16 ? 'TEMPORADA JUVENIL' : club.league.toUpperCase()} · FINALIZADA</strong></div>
      <div className="recap-club-mark"><img src={clubCrestUrl(club)} alt={`Escudo de ${club.name}`} /><span>{club.shortName} · T{player.season}</span></div>
      <p>{player.nickname || `${player.firstName} ${player.lastName}`} · {player.primaryPosition.toUpperCase()} · {player.favoriteNumber}</p>
      <h1>“{headline}”</h1>
      <h2>{award}</h2>
      <small>{player.clubRole} · {club.name}</small>
    </section>

    <section className="recap-kpis" aria-label="Estadísticas de la temporada">
      <RecapKpi value={projected.stats.matches} label="Partidos carrera" />
      <RecapKpi value={projected.stats.goals} label="Goles carrera" accent />
      <RecapKpi value={projected.stats.assists} label="Asistencias carrera" />
      <RecapKpi value={rating.toFixed(1)} label="Nota promedio" />
      <RecapKpi value={`#${position}`} label="Posición del club" />
      <RecapKpi value={formatMoney(marketValue)} label="Valor proyectado" />
    </section>

    <section className="recap-panel standings-panel">
      <div className="recap-section-title"><div><span>01 · COMPETICIÓN</span><h2>{player.age < 16 ? 'Liga Juvenil Regional' : club.league}</h2></div><em>CLASIFICACIÓN FICTICIA DE ESTA PARTIDA</em></div>
      <div className="standings-head"><span>#</span><span>Club</span><span>Progreso</span><span>PJ</span><span>G</span><span>E</span><span>P</span><strong>PTS</strong></div>
      <div className="standings-list">
        {standings.map((entry, index) => <div className={entry.club.id === club.id ? 'standing-row player-team' : 'standing-row'} key={entry.club.id}>
          <span className="standing-position">{index + 1}</span>
          <div className="standing-club"><img src={clubCrestUrl(entry.club)} alt="" /><strong>{entry.club.shortName}</strong>{entry.club.id === club.id && <em>TU CLUB</em>}</div>
          <div className="standing-progress"><i><b style={{ width: `${Math.round((entry.points / standings[0].points) * 100)}%` }} /></i></div>
          <span>{entry.played}</span><span>{entry.won}</span><span>{entry.drawn}</span><span>{entry.lost}</span><strong>{entry.points}</strong>
        </div>)}
      </div>
    </section>

    <div className="recap-columns">
      <section className="recap-panel achievement-panel">
        <div className="recap-section-title"><div><span>02 · TU HUELLA</span><h2>Lo que dejó la temporada</h2></div></div>
        <div className="achievement-list">{achievements.map((achievement, index) => <article key={`${achievement.title}-${index}`}><span>{achievement.icon}</span><div><strong>{achievement.title}</strong><p>{achievement.text}</p></div></article>)}</div>
      </section>

      <aside className="recap-sidebar">
        <section className="recap-card mentor-card"><span>03 · PERSONAS</span><h3>{mentor?.name ?? 'Tu primer entrenador'}</h3><p>{mentor ? `${mentor.relationshipValue} puntos de vínculo. ${mentor.history.at(-1)}` : 'Alguien del barrio sigue pendiente de tu camino.'}</p><div><i><b style={{ width: `${mentor?.relationshipValue ?? 50}%` }} /></i><strong>{mentor?.relationshipValue ?? 50}/100</strong></div></section>
        <section className="recap-card duel-card"><span>04 · RIVALIDAD</span><h3>Tu duelo de carrera</h3><div className="duel-clubs"><div><img src={clubCrestUrl(club)} alt="" /><strong>{contributions}</strong><small>{club.shortName}</small></div><b>VS</b><div><img src={clubCrestUrl(rival)} alt="" /><strong>{rivalGoals}</strong><small>{rival.shortName}</small></div></div><p>{contributions >= rivalGoals ? 'Cierras el año por delante. La rivalidad ya tiene memoria.' : 'Terminas por detrás. La próxima temporada trae revancha.'}</p></section>
        <section className="recap-card economy-card"><span>05 · ECONOMÍA</span><h3>{formatMoney(marketValue)}</h3><p>Valor de carrera proyectado. Tus finanzas disponibles quedan en US$ {player.stats.finances * 100}.</p><div className="economy-meter"><i><b style={{ width: `${Math.min(100, projected.stats.reputation + projected.stats.talent / 2)}%` }} /></i></div></section>
      </aside>
    </div>

    <section className="recap-next-season"><div><span>LA HISTORIA CONTINÚA</span><h2>La temporada {player.season + 1} ya te está esperando.</h2><p>Cumplirás {player.age + 1} años. Tus estadísticas, decisiones, entrenamientos y vínculos viajarán contigo.</p></div><button className="button primary" type="button" onClick={onAdvance}>Comenzar la próxima temporada <span>→</span></button></section>
    <p className="recap-disclaimer">Resultados y clasificación generados para esta partida. No representan resultados deportivos reales.</p>
  </main>
}

function RecapKpi({ value, label, accent = false }: { value: number | string; label: string; accent?: boolean }) {
  return <div className={accent ? 'accent' : ''}><strong>{value}</strong><span>{label}</span></div>
}

function buildStandings(playerClub: RealClub, player: CareerPlayer, seed: number, contributions: number): Standing[] {
  const clubs = [playerClub, ...REAL_CLUBS.filter((club) => club.id !== playerClub.id)].slice(0, 8)
  return clubs.map((club, index) => {
    const played = player.age < 16 ? 18 : 30
    const base = 21 + Math.abs(seed + player.season * 71 + (index + 3) * 97) % (player.age < 16 ? 29 : 47)
    const rawPoints = club.id === playerClub.id ? base + Math.min(15, contributions * 2 + Math.round(player.stats.discipline / 20)) : base
    const points = Math.min(played * 3, rawPoints)
    const won = Math.min(played, Math.floor(points / 3))
    const drawn = Math.min(played - won, points - won * 3)
    return { club, points, played, won, drawn, lost: Math.max(0, played - won - drawn) }
  }).sort((a, b) => b.points - a.points)
}

function headlineFor(player: CareerPlayer, contributions: number, position: number) {
  if (player.age < 13) return 'El barrio ya encontró a su próxima joya'
  if (player.age < 16) return 'El semillero tiene un nombre para recordar'
  if (position === 1 && contributions >= 10) return 'El mejor del torneo también sabe ganar'
  if (contributions >= 12) return 'Una temporada imposible de ignorar'
  return 'Cada partido te acerca a la versión que soñaste'
}

function formatMoney(value: number) {
  if (value >= 1_000_000) return `US$ ${(value / 1_000_000).toFixed(1)}M`
  return `US$ ${Math.round(value / 1000)}K`
}
