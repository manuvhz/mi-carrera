import { useMemo, useState, type CSSProperties } from 'react'
import { REAL_CLUBS, clubById, clubCrestUrl, clubForPlayer, currentClubForPlayer } from '../content/real-clubs'
import { simulateSeason } from '../game/engine'
import { formatCareerMoney, hasCareerItem, idolatryTier } from '../game/career-systems'
import { APP_CONFIG } from '../config'
import { isNarrativeEventId } from '../game/history'
import { presentEventResult, presentEventTitle } from '../game/presentation'
import { transferOffersFor } from '../game/transfer-market'
import type { CareerPlayer } from '../game/types'
import { TransferMarket } from './TransferMarket'

interface SeasonRecapProps {
  player: CareerPlayer
  seed: number
  onAdvance: (nextClubId?: string) => void
}

export function SeasonRecap({ player, seed, onAdvance }: SeasonRecapProps) {
  const club = clubForPlayer(player)
  const leagueClubs = REAL_CLUBS.filter((item) => item.leagueId === club.leagueId)
  const simulation = useMemo(() => simulateSeason(player, seed, leagueClubs.length, club.prestige, club.leagueId), [player, seed, leagueClubs.length, club.prestige, club.leagueId])
  const projected = simulation.player
  const currentClub = currentClubForPlayer(player)
  const offers = useMemo(() => transferOffersFor(player, seed, hasCareerItem(player, 'super-agent') ? 4 : 3), [player, seed])
  const [nextClubId, setNextClubId] = useState<string | undefined>(() => currentClub?.id ?? (player.age >= 15 ? player.favoriteClubId : undefined))
  const seasonEntries = player.eventHistory.filter((entry) => entry.season === player.season)
  const trainingEntries = seasonEntries.filter((entry) => entry.eventId.startsWith('training-'))
  const storyEntries = seasonEntries.filter((entry) => isNarrativeEventId(entry.eventId))
  const seasonMatches = projected.stats.matches - player.stats.matches
  const seasonGoals = projected.stats.goals - player.stats.goals
  const seasonAssists = projected.stats.assists - player.stats.assists
  const goalLabel = `${seasonGoals} ${seasonGoals === 1 ? 'gol' : 'goles'}`
  const assistLabel = `${seasonAssists} ${seasonAssists === 1 ? 'asistencia' : 'asistencias'}`
  const contributions = seasonGoals + seasonAssists
  const rating = Math.min(9.9, 6 + contributions * .14 + player.stats.discipline * .007 + simulation.form * .008)
  const marketValue = Math.round(simulation.overall * simulation.overall * 5200 + projected.stats.reputation * 230000 + contributions * 120000)
  const position = simulation.position
  const seasonVerdict = seasonVerdictFor(position, leagueClubs.length)
  const mentor = player.narrativeCharacters[0]
  const rival = player.rival
  const rivalContributions = simulation.rivalSeason.goals + simulation.rivalSeason.assists
  const headline = headlineFor(player, contributions, position)
  const award = simulation.champion ? 'Campeón de la temporada' : player.age < 13 ? 'Promesa del año' : player.age < 16 ? 'Revelación juvenil' : contributions >= 12 ? 'Figura de la temporada' : 'Jugador en ascenso'
  const recapStyle = { '--recap-primary': club.colors[0], '--recap-secondary': club.colors[1] } as CSSProperties
  const destination = nextClubId ? clubById(nextClubId) : currentClub
  const changingClub = Boolean(destination && destination.id !== currentClub?.id)

  const achievements = [
    { icon: simulation.champion ? '🏆' : '◈', title: award, text: simulation.champion ? `Levantaste el título con ${club.shortName}. Esta temporada sí cambia tu historia.` : `La temporada te reconoce como ${award.toLowerCase()} en esta partida.` },
    { icon: '⚑', title: 'Decisiones con memoria', text: `Resolviste ${storyEntries.length} acontecimientos que seguirán influyendo en tu carrera.` },
    { icon: '⚡', title: 'Trabajo de entrenamiento', text: trainingEntries.length ? `Completaste ${trainingEntries.length} sesiones entre rutinas, táctica y retos de cancha.` : 'Todavía puedes hacer del entrenamiento una ventaja la próxima temporada.' },
    { icon: '★', title: 'Impacto ofensivo', text: `${goalLabel} y ${assistLabel} en ${seasonMatches} partidos simulados.` },
    { icon: '♟', title: 'Lugar en el equipo', text: `${player.clubRole}. El cuerpo técnico valora tu disciplina en ${player.stats.discipline}/100.` },
    { icon: '●', title: 'El nombre empieza a circular', text: `Tu reputación proyectada termina en ${projected.stats.reputation}/100.` },
    { icon: '💰', title: 'Contrato y premios', text: `Ingresaste ${formatCareerMoney(simulation.earnings, true)} esta temporada. Ya puedes convertir el dinero en carrera deportiva.` },
    ...storyEntries.slice(-3).map((entry) => ({ icon: '✦', title: presentEventTitle(entry.title), text: presentEventResult(entry.result, entry.title) })),
  ]

  return <main className="season-page" style={recapStyle}>
    <section className={simulation.champion ? 'recap-hero recap-hero-champion' : 'recap-hero'}>
      <div className="recap-hero-top"><span>RESUMEN DE TEMPORADA</span><strong>{player.age < 16 ? 'TEMPORADA JUVENIL' : club.league.toUpperCase()} · FINALIZADA</strong></div>
      <div className="recap-club-mark"><img src={clubCrestUrl(club)} alt={`Escudo de ${club.name}`} /><span>{club.shortName} · T{player.season}</span></div>
      <p>{player.nickname || `${player.firstName} ${player.lastName}`} · {player.primaryPosition.toUpperCase()} · {player.favoriteNumber}</p>
      <h1>“{headline}”</h1>
      <h2>{award}</h2>
      <small>{player.clubRole} · {club.name}</small>
    </section>

    {simulation.champion && <section className="champion-celebration" role="status" aria-label="Celebración del título"><div className="confetti" aria-hidden="true">✦ ● ✦ ● ✦</div><span>🏆</span><div><small>CAMPEONES</small><strong>¡LEVANTASTE LA LIGA!</strong><p>El título ya aparece en tu palmarés. Esta no fue una temporada más.</p></div></section>}

    <section className="recap-kpis" aria-label="Estadísticas de la temporada">
      <RecapKpi value={projected.stats.matches} label="Partidos carrera" />
      <RecapKpi value={projected.stats.goals} label="Goles carrera" accent />
      <RecapKpi value={projected.stats.assists} label="Asistencias carrera" />
      <RecapKpi value={rating.toFixed(1)} label="Nota promedio" />
      <RecapKpi value={`#${position}`} label="Posición del club" />
      <RecapKpi value={formatCareerMoney(Math.round(marketValue / 1000), true)} label="Valor proyectado" />
    </section>

    <section className="recap-panel season-result-panel">
      <div className="recap-section-title"><div><span>01 · COMPETICIÓN</span><h2>{player.age < 16 ? 'Liga Juvenil Regional' : club.league}</h2></div><em>CIERRE GENERADO PARA ESTA CARRERA</em></div>
      <div className="season-finish">
        <div className="finish-club"><img src={clubCrestUrl(club)} alt={`Escudo de ${club.name}`} /><span>TU EQUIPO</span><strong>{club.name}</strong><small>{club.city} · {club.country}</small></div>
        <div className="finish-position"><span>POSICIÓN FINAL</span><strong>#{position}</strong><small>entre {leagueClubs.length} equipos representados</small></div>
        <div className="finish-reading"><span>LECTURA DE TEMPORADA</span><strong>{seasonVerdict}</strong><p>{seasonMatches} partidos, {goalLabel} y {assistLabel}. Eso es todo lo necesario para entender cómo cerró el equipo.</p></div>
      </div>
    </section>

    <section className="recap-panel competition-panel">
      <div className="recap-section-title"><div><span>02 · COPAS Y PREMIOS</span><h2>Todo lo que jugaste este año</h2></div><em>LOS TÍTULOS SE GUARDAN EN TU PALMARÉS</em></div>
      <div className="competition-grid">{simulation.competitions.map((competition) => <article className={competition.won ? 'won' : ''} key={competition.id}><span>{competition.kind === 'individual' ? '⭐' : competition.kind === 'international' ? '🏳️' : competition.kind === 'continental' ? '🌍' : competition.kind === 'cup' ? '🏆' : '⚽'}</span><div><small>{competition.kind === 'international' ? 'SELECCIÓN' : competition.kind === 'continental' ? 'INTERNACIONAL' : competition.kind === 'individual' ? 'PREMIO INDIVIDUAL' : 'NACIONAL'}</small><strong>{competition.name}</strong><p>{competition.result}</p></div>{competition.won && <b>CAMPEÓN</b>}</article>)}</div>
    </section>

    <div className="recap-columns">
      <section className="recap-panel achievement-panel">
        <div className="recap-section-title"><div><span>03 · TU HUELLA</span><h2>Lo que dejó la temporada</h2></div></div>
        <div className="achievement-list">{achievements.map((achievement, index) => <article key={`${achievement.title}-${index}`}><span>{achievement.icon}</span><div><strong>{achievement.title}</strong><p>{achievement.text}</p></div></article>)}</div>
      </section>

      <aside className="recap-sidebar">
        <section className="recap-card mentor-card"><span>04 · PERSONAS</span><h3>{mentor?.name ?? 'Tu primer entrenador'}</h3><p>{mentor ? `${mentor.relationshipValue} puntos de vínculo. ${mentor.history.at(-1)}` : 'Alguien del barrio sigue pendiente de tu camino.'}</p><div><i><b style={{ width: `${mentor?.relationshipValue ?? 50}%` }} /></i><strong>{mentor?.relationshipValue ?? 50}/100</strong></div></section>
        <section className="recap-card duel-card"><span>05 · RIVALIDAD</span><h3>{rival?.name ?? 'Tu duelo de carrera'}</h3><div className="duel-clubs"><div><i>{player.firstName.slice(0, 1)}</i><strong>{contributions}</strong><small>TÚ</small></div><b>VS</b><div><i>{rival?.name.slice(0, 1) ?? '?'}</i><strong>{rivalContributions}</strong><small>{rival?.nickname ?? 'RIVAL'}</small></div></div><p>{contributions >= rivalContributions ? 'Cierras el año por delante. La rivalidad ya tiene memoria.' : 'Terminas por detrás. La próxima temporada trae revancha.'}</p></section>
        <section className="recap-card economy-card"><span>06 · ECONOMÍA</span><h3>{formatCareerMoney(simulation.earnings, true)}</h3><p>Ganaste esta temporada. Tu saldo proyectado es {formatCareerMoney(projected.stats.finances, true)} para entrenamiento, staff, lujos y proyectos de legado.</p><div className="economy-meter"><i><b style={{ width: `${Math.min(100, projected.stats.reputation + projected.stats.talent / 2)}%` }} /></i></div></section>
        {player.currentClubId && <section className="recap-card idolatry-card"><span>07 · IDOLATRÍA</span><h3>{idolatryTier(player.clubIdolatries?.[player.currentClubId] ?? 0)}</h3><p>Tu vínculo con la afición de {club.shortName} seguirá creciendo al aplicar este cierre de temporada.</p></section>}
      </aside>
    </div>

    <TransferMarket player={player} offers={offers} value={nextClubId} onChange={setNextClubId} />

    <section className="recap-next-season"><div><span>{changingClub ? 'NUEVO CAPÍTULO' : 'LA HISTORIA CONTINÚA'}</span><h2>{changingClub && destination ? `${destination.shortName} te espera.` : `La temporada ${player.season + 1} ya te está esperando.`}</h2><p>Cumplirás {nextCareerAge(player.age)} años. {changingClub && destination ? `La próxima escena comenzará en ${destination.city}, dentro de ${destination.league}.` : 'Tus estadísticas, decisiones, entrenamientos y vínculos viajarán contigo.'}</p></div><button className="button primary" type="button" onClick={() => onAdvance(nextClubId)}>{changingClub ? 'Firmar y comenzar temporada' : 'Comenzar la próxima temporada'} <span>→</span></button></section>
    <p className="recap-disclaimer">La posición final es ficticia y se genera solo para esta carrera. No representa resultados deportivos reales.</p>
  </main>
}

function RecapKpi({ value, label, accent = false }: { value: number | string; label: string; accent?: boolean }) {
  return <div className={accent ? 'accent' : ''}><strong>{value}</strong><span>{label}</span></div>
}

function seasonVerdictFor(position: number, leagueSize: number) {
  if (position === 1) return 'Campeones de la temporada'
  if (position <= Math.max(3, Math.ceil(leagueSize * .3))) return 'Una campaña peleando arriba'
  if (position <= Math.ceil(leagueSize * .7)) return 'Una temporada estable'
  return 'Un año difícil que exige reacción'
}

function nextCareerAge(age: number) {
  return age + (age < 16 ? Math.min(APP_CONFIG.youthYearsPerSeason, 16 - age) : 1)
}

function headlineFor(player: CareerPlayer, contributions: number, position: number) {
  if (player.age < 13) return 'El barrio ya encontró a su próxima joya'
  if (player.age < 16) return 'El semillero tiene un nombre para recordar'
  if (position === 1 && contributions >= 10) return 'El mejor del torneo también sabe ganar'
  if (contributions >= 12) return 'Una temporada imposible de ignorar'
  return 'Cada partido te acerca a la versión que soñaste'
}
