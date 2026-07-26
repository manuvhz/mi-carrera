import { useMemo, useState } from 'react'
import { seededRandom } from '../game/engine'
import { formatCareerMoney } from '../game/career-systems'
import { useCareerStore, type CareerUpgradeId, type TacticalFocusId, type TrainingSessionId } from '../stores/career-store'

type GameId = 'penalties' | 'reactions' | 'passing'

const SESSIONS = [
  { id: 'strength', icon: '▲', kind: 'SESIÓN RÁPIDA', title: 'Trabajo de velocidad', text: 'Potencia, aceleración y cambios de ritmo.', reward: '+3 Velocidad · +1 Disciplina', tone: 'power' },
  { id: 'recovery', icon: '↻', kind: 'SESIÓN RÁPIDA', title: 'Recuperación activa', text: 'Movilidad, descanso y cuidado del cuerpo.', reward: '+3 Resistencia · +1 Mentalidad', tone: 'recovery' },
  { id: 'tactics', icon: '▦', kind: 'DECISIÓN TÁCTICA', title: 'Trabajo de pizarra', text: 'Elige un plan y define qué aspecto entrenar.', reward: '3 planes disponibles', tone: 'tactics' },
] as const satisfies ReadonlyArray<{ id: TrainingSessionId; icon: string; kind: string; title: string; text: string; reward: string; tone: string }>

const GAMES = [
  { id: 'penalties', icon: '◎', kind: 'MINIJUEGO', title: 'Duelo de penales', text: 'Tres remates con resultado visible en cada tiro.', reward: 'Pegada + Mentalidad' },
  { id: 'reactions', icon: '⚡', kind: 'RETO DE REFLEJOS', title: 'Reflejos bajo presión', text: 'Cinco señales con un patrón nuevo cada temporada.', reward: 'Velocidad + Resistencia' },
  { id: 'passing', icon: '◇', kind: 'LECTURA TÁCTICA', title: 'Visión de pase', text: 'Cuatro escenarios distintos, cada uno con su propia jugada.', reward: 'Visión + Disciplina' },
] as const

const UPGRADES = [
  { id: 'coach', icon: '◉', title: 'Entrenador personal', text: 'Pegada +2 · Visión +1', cost: 5 },
  { id: 'sprint', icon: '⚡', title: 'Plan de velocidad', text: 'Velocidad +2 · Resistencia +1', cost: 4 },
  { id: 'finishing', icon: '◎', title: 'Clínica de definición', text: 'Pegada +1 · Mentalidad +2', cost: 6 },
] as const satisfies ReadonlyArray<{ id: CareerUpgradeId; icon: string; title: string; text: string; cost: number }>

export function TrainingArcade() {
  const { player, seed, completeMiniGame, completeTrainingSession, purchaseCareerUpgrade } = useCareerStore()
  const [activeGame, setActiveGame] = useState<GameId | null>(null)
  const [activeSession, setActiveSession] = useState<TrainingSessionId | null>(null)
  const [result, setResult] = useState<string | null>(null)
  if (!player || player.careerStage === 'retirement') return null
  const isPlayed = (game: GameId) => player.activeFlags.includes(`minigame:${game}:season:${player.season}`)
  const isSessionDone = (session: TrainingSessionId) => player.activeFlags.includes(`training:${session}:season:${player.season}`)
  const finish = (game: GameId, score: number, maximum: number) => {
    completeMiniGame(game, score, maximum)
    setResult(`${game === 'penalties' ? '⚽' : '✓'} Resultado ${score}/${maximum}. La mejora ya fue guardada en tu carrera.`)
  }
  const finishSession = (session: TrainingSessionId, focus?: TacticalFocusId) => {
    completeTrainingSession(session, focus)
    setActiveSession(null)
    setResult(session === 'tactics' ? 'Plan táctico completado. La elección ya modificó tus atributos.' : 'Sesión completada. La mejora ya fue aplicada a tu carrera.')
  }
  const sessionCount = SESSIONS.filter((session) => isSessionDone(session.id)).length
  const gameCount = GAMES.filter((game) => isPlayed(game.id)).length
  const investedThisSeason = player.activeFlags.some((flag) => flag.startsWith('investment:') && flag.endsWith(`:season:${player.season}`))

  return <section className="training-arcade training-center" aria-labelledby="training-title">
    <div className="training-heading"><div><p className="eyebrow">CENTRO DE ENTRENAMIENTO</p><h2 id="training-title">Arma tu semana de trabajo.</h2><p>No todo es un minijuego: combina sesiones rápidas, decisiones de pizarra y retos de cancha.</p></div><div className="training-progress"><span>{sessionCount}/3 SESIONES</span><span>{gameCount}/3 RETOS</span></div></div>

    <div className="career-investment"><div className="investment-copy"><span>{formatCareerMoney(player.stats.finances, true)} DISPONIBLES</span><strong>El dinero mejora tu carrera</strong><small>Una inversión rápida por temporada. El staff permanente y los lujos están en la tienda.</small><a href="#/tienda">ABRIR TIENDA COMPLETA →</a></div><div className="investment-options">{UPGRADES.map((upgrade) => {
      const affordable = player.stats.finances >= upgrade.cost
      return <button type="button" key={upgrade.id} disabled={investedThisSeason || !affordable} onClick={() => { purchaseCareerUpgrade(upgrade.id); setResult(`${upgrade.title} contratado. La inversión ya se nota en tus atributos.`) }}><span>{investedThisSeason ? '✓' : upgrade.icon}</span><div><strong>{upgrade.title}</strong><small>{upgrade.text}</small></div><b>{investedThisSeason ? 'INVERSIÓN HECHA' : affordable ? formatCareerMoney(upgrade.cost, true) : 'SALDO INSUFICIENTE'}</b></button>
    })}</div></div>

    <div className="training-section-heading"><div><span>01</span><div><strong>Rutinas y preparación</strong><small>Sin puntuación. Entra, trabaja y sigue con tu carrera.</small></div></div><em>{sessionCount}/3 HECHAS</em></div>
    <div className="session-grid">
      {SESSIONS.map((session) => <button type="button" data-tone={session.tone} key={session.id} disabled={isSessionDone(session.id)} className={activeSession === session.id ? 'session-card active' : 'session-card'} onClick={() => {
        setActiveGame(null); setResult(null)
        if (session.id === 'tactics') setActiveSession('tactics')
        else finishSession(session.id)
      }}>
        <span className="session-icon">{isSessionDone(session.id) ? '✓' : session.icon}</span><div><small>{isSessionDone(session.id) ? 'COMPLETADA' : session.kind}</small><h3>{session.title}</h3><p>{session.text}</p><em>{session.reward}</em></div><b>{isSessionDone(session.id) ? 'LISTO' : session.id === 'tactics' ? 'ELEGIR PLAN →' : 'COMPLETAR →'}</b>
      </button>)}
    </div>

    {activeSession === 'tactics' && !isSessionDone('tactics') && <div className="game-stage tactical-stage">
      <button className="game-close" type="button" aria-label="Cerrar sesión táctica" onClick={() => setActiveSession(null)}>×</button>
      <TacticalSession onChoose={(focus) => finishSession('tactics', focus)} />
    </div>}

    <div className="training-section-heading challenge-heading"><div><span>02</span><div><strong>Retos de cancha</strong><small>Aquí sí juegas: cada reto mide una habilidad distinta.</small></div></div><em>{gameCount}/3 SUPERADOS</em></div>
    <div className="training-grid">
      {GAMES.map((game) => <button type="button" key={game.id} disabled={isPlayed(game.id)} className={activeGame === game.id ? 'training-game active' : 'training-game'} onClick={() => { setActiveSession(null); setActiveGame(game.id); setResult(null) }}>
        <span className="game-icon">{isPlayed(game.id) ? '✓' : game.icon}</span><small>{isPlayed(game.id) ? 'COMPLETADO' : game.kind}</small><h3>{game.title}</h3><p>{game.text}</p><em>{game.reward}</em><b>{isPlayed(game.id) ? 'LISTO' : 'ABRIR RETO →'}</b>
      </button>)}
    </div>
    {activeGame && !isPlayed(activeGame) && <div className="game-stage">
      <button className="game-close" type="button" aria-label="Cerrar reto" onClick={() => setActiveGame(null)}>×</button>
      {activeGame === 'penalties' && <PenaltyGame seed={seed} season={player.season} onFinish={(score) => finish('penalties', score, 3)} />}
      {activeGame === 'reactions' && <ReactionGame seed={seed} season={player.season} onFinish={(score) => finish('reactions', score, 5)} />}
      {activeGame === 'passing' && <PassingGame seed={seed} season={player.season} onFinish={(score) => finish('passing', score, 4)} />}
    </div>}
    {result && <div className="training-result" role="status"><strong>TRABAJO COMPLETADO</strong><span>{result}</span></div>}
  </section>
}

function TacticalSession({ onChoose }: { onChoose: (focus: TacticalFocusId) => void }) {
  const plans = [
    { id: 'pressing', number: '4-3-3', title: 'Presión alta', text: 'Saltar juntos sobre la salida rival.', reward: '+2 Disciplina · +1 Velocidad' },
    { id: 'possession', number: '4-2-3-1', title: 'Cuidar la pelota', text: 'Crear líneas de pase y sostener la posesión.', reward: '+2 Pegada · +1 Visión' },
    { id: 'counter', number: '4-4-2', title: 'Atacar espacios', text: 'Replegar y acelerar apenas recuperas.', reward: '+2 Visión · +1 Mentalidad' },
  ] as const
  return <div className="tactical-session"><p className="eyebrow">REUNIÓN CON EL CUERPO TÉCNICO</p><h3>¿Qué plan quieres ensayar?</h3><p>Esto no es un examen: eliges el foco de la sesión y la carrera recuerda tu decisión.</p><div className="tactical-options">{plans.map((plan) => <button type="button" key={plan.id} onClick={() => onChoose(plan.id)}><span>{plan.number}</span><strong>{plan.title}</strong><small>{plan.text}</small><em>{plan.reward}</em></button>)}</div></div>
}

function PenaltyGame({ seed, season, onFinish }: { seed: number; season: number; onFinish: (score: number) => void }) {
  const [shots, setShots] = useState<Array<'goal' | 'save'>>([])
  const goals = shots.filter((shot) => shot === 'goal').length
  const keeperZones = useMemo(() => {
    const random = seededRandom(seed + season * 811)
    return Array.from({ length: 3 }, () => Math.floor(random() * 5))
  }, [seed, season])
  const lastShot = shots.at(-1)
  const shoot = (zone: number) => {
    if (shots.length >= 3) return
    const next = [...shots, zone === keeperZones[shots.length] ? 'save' as const : 'goal' as const]
    setShots(next)
    if (next.length === 3) onFinish(next.filter((shot) => shot === 'goal').length)
  }
  return <div className="penalty-game"><p className="eyebrow">TRES DISPAROS · ELIGE UNA ESQUINA</p><h3>{shots.length < 3 ? `Penal ${shots.length + 1} de 3` : `${goals} goles de 3`}</h3>{lastShot && <div className={`penalty-flash ${lastShot}`} role="status"><span>{lastShot === 'goal' ? '⚽' : '🧤'}</span><strong>{lastShot === 'goal' ? '¡GOL!' : '¡ATAJÓ!'}</strong></div>}<div className="goal-mouth" aria-label="Zonas del arco">
    {['Arriba izquierda', 'Arriba centro', 'Arriba derecha', 'Abajo izquierda', 'Abajo derecha'].map((label, index) => <button type="button" aria-label={label} key={label} onClick={() => shoot(index)} disabled={shots.length >= 3}><span>⚽</span></button>)}
  </div><div className="shot-history" aria-label="Resultado de los remates">{[0, 1, 2].map((index) => <span key={index} className={shots[index] ?? ''}>{shots[index] === 'goal' ? '⚽ GOL' : shots[index] === 'save' ? '🧤 ATAJADO' : '· PENDIENTE'}</span>)}</div></div>
}

function ReactionGame({ seed, season, onFinish }: { seed: number; season: number; onFinish: (score: number) => void }) {
  const targets = useMemo(() => {
    const random = seededRandom(seed + season * 1297)
    return Array.from({ length: 5 }, () => Math.floor(random() * 5))
  }, [seed, season])
  const [attempt, setAttempt] = useState(0)
  const [correct, setCorrect] = useState(0)
  const symbols = ['▲', '●', '■', '◆', '✦']
  const choose = (index: number) => {
    if (attempt >= targets.length) return
    const nextCorrect = correct + (index === targets[attempt] ? 1 : 0)
    setCorrect(nextCorrect); setAttempt(attempt + 1)
    if (attempt + 1 === targets.length) onFinish(nextCorrect)
  }
  return <div className="reaction-game"><p className="eyebrow">LEE LA SEÑAL · CINCO INTENTOS</p><h3>{attempt < 5 ? `Toca ${symbols[targets[attempt]]}` : `${correct} aciertos de 5`}</h3><div className="reaction-pads">{symbols.map((symbol, index) => <button type="button" key={symbol} onClick={() => choose(index)} disabled={attempt >= 5}>{symbol}</button>)}</div><p className="game-progress">INTENTO {Math.min(attempt + 1, 5)}/5</p></div>
}

function PassingGame({ seed, season, onFinish }: { seed: number; season: number; onFinish: (score: number) => void }) {
  const plays = useMemo(() => {
    const options = ['Pared rápida', 'Cambio de frente', 'Pase filtrado']
    const base = [
      { label: 'BLOQUEO CENTRAL', situation: 'Dos rivales cierran el centro.', clue: 'Hay espacio libre en la banda contraria.', answer: 1, shape: 'wide' },
      { label: 'RUPTURA', situation: 'Tu extremo acelera detrás del lateral.', clue: 'El pase debe superar la última línea.', answer: 2, shape: 'depth' },
      { label: 'ESPACIO CORTO', situation: 'El bloque rival está muy junto.', clue: 'Necesitas combinar con un compañero cercano.', answer: 0, shape: 'wall' },
      { label: 'ÚLTIMA JUGADA', situation: 'Quedan diez segundos y el nueve pica al área.', clue: 'No hay tiempo para circular de lado a lado.', answer: 2, shape: 'final' },
    ]
    const random = seededRandom(seed + season * 1879)
    const shuffled = [...base]
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const target = Math.floor(random() * (index + 1))
      const current = shuffled[index]
      shuffled[index] = shuffled[target]
      shuffled[target] = current
    }
    return shuffled.map((play) => ({ ...play, options }))
  }, [seed, season])
  const [play, setPlay] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [feedback, setFeedback] = useState<string | null>(null)
  const choose = (index: number) => {
    if (play >= plays.length) return
    const solved = index === plays[play].answer
    const nextCorrect = correct + (solved ? 1 : 0)
    setFeedback(solved ? '✓ Lectura correcta. El escenario cambia.' : `✕ La mejor salida era ${plays[play].options[plays[play].answer]}. Ahora cambia la jugada.`)
    setCorrect(nextCorrect); setPlay(play + 1)
    if (play + 1 === plays.length) onFinish(nextCorrect)
  }
  const current = plays[Math.min(play, plays.length - 1)]
  return <div className="passing-game"><p className="eyebrow">JUGADA {Math.min(play + 1, 4)} · {play < 4 ? current.label : 'COMPLETADO'}</p>{feedback && play < 4 && <p className="passing-feedback" role="status">{feedback}</p>}<div className={`passing-pitch pitch-${current.shape}`}><span>⚽</span><i /><i /><i /><b>ARCO</b></div><h3>{play < 4 ? current.situation : `${correct} decisiones correctas de 4`}</h3>{play < 4 && <p className="passing-clue">{current.clue}</p>}<div className="passing-options">{current.options.map((option, index) => <button type="button" key={option} onClick={() => choose(index)} disabled={play >= 4}>{option}</button>)}</div><p className="game-progress">{play < 4 ? `ESCENARIO ${play + 1}/4 · LA CANCHA CAMBIA EN CADA JUGADA` : 'LECTURA COMPLETADA'}</p></div>
}
