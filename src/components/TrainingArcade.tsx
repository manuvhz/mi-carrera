import { useMemo, useState } from 'react'
import { useCareerStore } from '../stores/career-store'

type GameId = 'penalties' | 'reactions' | 'passing'

const GAMES = [
  { id: 'penalties', icon: '◎', title: 'Duelo de penales', text: 'Elige una zona, engaña al arquero y define con precisión.', reward: 'Técnica + Confianza' },
  { id: 'reactions', icon: '⚡', title: 'Reflejos bajo presión', text: 'Lee la señal y toca el objetivo correcto antes de dudar.', reward: 'Físico + Resiliencia' },
  { id: 'passing', icon: '◇', title: 'Visión de pase', text: 'Encuentra la salida correcta en cuatro jugadas cerradas.', reward: 'Talento + Disciplina' },
] as const

export function TrainingArcade() {
  const { player, seed, completeMiniGame } = useCareerStore()
  const [activeGame, setActiveGame] = useState<GameId | null>(null)
  const [result, setResult] = useState<string | null>(null)
  if (!player || player.careerStage === 'retirement') return null
  const isPlayed = (game: GameId) => player.activeFlags.includes(`minigame:${game}:season:${player.season}`)
  const finish = (game: GameId, score: number, maximum: number) => {
    completeMiniGame(game, score, maximum)
    setResult(`Resultado ${score}/${maximum}. La mejora ya fue guardada en tu carrera.`)
  }

  return <section className="training-arcade" aria-labelledby="training-title">
    <div className="training-heading"><div><p className="eyebrow">CENTRO DE ENTRENAMIENTO</p><h2 id="training-title">Juega. Mejora. Déjalo en la cancha.</h2><p>Cada reto se puede completar una vez por temporada y modifica tu carrera real.</p></div><span>{GAMES.filter((game) => isPlayed(game.id)).length}/3 COMPLETADOS</span></div>
    <div className="training-grid">
      {GAMES.map((game) => <button type="button" key={game.id} disabled={isPlayed(game.id)} className={activeGame === game.id ? 'training-game active' : 'training-game'} onClick={() => { setActiveGame(game.id); setResult(null) }}>
        <span className="game-icon">{isPlayed(game.id) ? '✓' : game.icon}</span><small>{isPlayed(game.id) ? 'COMPLETADO' : 'MINIJUEGO'}</small><h3>{game.title}</h3><p>{game.text}</p><em>{game.reward}</em>
      </button>)}
    </div>
    {activeGame && !isPlayed(activeGame) && <div className="game-stage">
      <button className="game-close" type="button" aria-label="Cerrar minijuego" onClick={() => setActiveGame(null)}>×</button>
      {activeGame === 'penalties' && <PenaltyGame seed={seed} season={player.season} onFinish={(score) => finish('penalties', score, 3)} />}
      {activeGame === 'reactions' && <ReactionGame seed={seed} season={player.season} onFinish={(score) => finish('reactions', score, 5)} />}
      {activeGame === 'passing' && <PassingGame seed={seed} season={player.season} onFinish={(score) => finish('passing', score, 4)} />}
    </div>}
    {result && <div className="training-result" role="status"><strong>ENTRENAMIENTO COMPLETADO</strong><span>{result}</span></div>}
  </section>
}

function PenaltyGame({ seed, season, onFinish }: { seed: number; season: number; onFinish: (score: number) => void }) {
  const [shots, setShots] = useState<Array<'goal' | 'save'>>([])
  const goals = shots.filter((shot) => shot === 'goal').length
  const keeperZone = Math.abs(seed + season * 11 + shots.length * 7) % 5
  const shoot = (zone: number) => {
    if (shots.length >= 3) return
    const next = [...shots, zone === keeperZone ? 'save' as const : 'goal' as const]
    setShots(next)
    if (next.length === 3) onFinish(next.filter((shot) => shot === 'goal').length)
  }
  return <div className="penalty-game"><p className="eyebrow">TRES DISPAROS · ELIGE UNA ESQUINA</p><h3>{shots.length < 3 ? `Penal ${shots.length + 1} de 3` : `${goals} goles de 3`}</h3><div className="goal-mouth" aria-label="Zonas del arco">
    {['Arriba izquierda', 'Arriba centro', 'Arriba derecha', 'Abajo izquierda', 'Abajo derecha'].map((label, index) => <button type="button" aria-label={label} key={label} onClick={() => shoot(index)} disabled={shots.length >= 3}><span>●</span></button>)}
  </div><div className="shot-dots">{[0, 1, 2].map((index) => <i key={index} className={shots[index] ?? ''} />)}</div></div>
}

function ReactionGame({ seed, season, onFinish }: { seed: number; season: number; onFinish: (score: number) => void }) {
  const targets = useMemo(() => Array.from({ length: 5 }, (_, index) => Math.abs(seed + season * 13 + index * 17) % 5), [seed, season])
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
  const situations = ['Dos rivales cierran el centro.', 'Tu extremo ataca el espacio.', 'El bloque rival está muy junto.', 'Quedan diez segundos de partido.']
  const options = ['Pared rápida', 'Cambio de frente', 'Pase filtrado']
  const answers = useMemo(() => situations.map((_, index) => Math.abs(seed + season * 5 + index * 11) % 3), [seed, season])
  const [play, setPlay] = useState(0)
  const [correct, setCorrect] = useState(0)
  const choose = (index: number) => {
    if (play >= situations.length) return
    const nextCorrect = correct + (index === answers[play] ? 1 : 0)
    setCorrect(nextCorrect); setPlay(play + 1)
    if (play + 1 === situations.length) onFinish(nextCorrect)
  }
  return <div className="passing-game"><p className="eyebrow">LEE LA JUGADA · ELIGE LA SALIDA</p><div className="passing-pitch"><span>⚽</span><i /><i /><i /></div><h3>{play < 4 ? situations[play] : `${correct} decisiones correctas de 4`}</h3><div className="passing-options">{options.map((option, index) => <button type="button" key={option} onClick={() => choose(index)} disabled={play >= 4}>{option}</button>)}</div><p className="game-progress">JUGADA {Math.min(play + 1, 4)}/4</p></div>
}
