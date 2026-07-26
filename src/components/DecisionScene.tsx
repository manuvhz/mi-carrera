import { useEffect } from 'react'
import { clubCrestUrl, clubForPlayer } from '../content/real-clubs'
import { careerDecisionIdentity, choiceArchetype, eventStakeStats, riskLevel, sceneProfile, STAT_LABELS } from '../game/experience'
import { presentChoiceText, presentEventDescription, presentEventTitle } from '../game/presentation'
import type { CareerEvent, CareerPlayer, EventChoice, StatEffect } from '../game/types'

const STAGE_LABELS: Record<CareerEvent['stage'], string> = {
  childhood: 'Infancia y barrio', academy: 'Formación juvenil', debut: 'Primeros pasos', consolidation: 'Consolidación',
  prime: 'Mejor etapa', veteran: 'Madurez', 'final-years': 'Últimos años', retirement: 'Retiro y legado',
}

const RARITY_LABELS: Record<CareerEvent['rarity'], string> = { common: 'Momento de carrera', uncommon: 'Poco común', rare: 'Momento raro', legendary: '✦ Legendario' }

export function DecisionScene({ event, player, onChoose }: { event: CareerEvent; player: CareerPlayer; onChoose: (choice: EventChoice) => void }) {
  const description = presentEventDescription(event.description, event.title)
  const beats = description.match(/[^.!?]+[.!?]+|[^.!?]+$/gu)?.map((beat) => beat.trim()).filter(Boolean) ?? [description]
  const hook = beats[0]
  const pressure = beats.length > 1 ? beats.at(-1) : 'El siguiente paso depende de ti.'
  const context = beats.slice(1, -1)
  const profile = sceneProfile(event)
  const stakes = eventStakeStats(event)
  const identity = careerDecisionIdentity(player.eventHistory)
  const club = clubForPlayer(player)
  const maximumRisk = Math.max(...event.choices.map((choice) => riskLevel(choice.riskLabel)))

  useEffect(() => {
    const handleKey = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.ctrlKey || keyboardEvent.altKey || keyboardEvent.metaKey || /input|select|textarea/i.test((keyboardEvent.target as HTMLElement)?.tagName ?? '')) return
      const index = Number(keyboardEvent.key) - 1
      if (index >= 0 && index < event.choices.length) onChoose(event.choices[index])
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [event, onChoose])

  return <section className={`decision-scene scene-${profile.id}`} aria-labelledby="decision-title">
    <div className="scene-topline">
      <div><span>{profile.icon}</span><strong>{profile.label}</strong><small>{profile.line}</small></div>
      <div className="scene-pressure-meter"><span>TENSIÓN</span><i>{[1, 2, 3, 4, 5].map((level) => <b className={level <= maximumRisk ? 'active' : ''} key={level} />)}</i></div>
    </div>

    <div className="scene-layout">
      <article className="scene-story">
        <div className="scene-meta"><span>{event.category}</span><span>{STAGE_LABELS[event.stage]}</span><span className={`rarity-${event.rarity}`}>{RARITY_LABELS[event.rarity]}</span></div>
        <h2 id="decision-title">{presentEventTitle(event.title)}</h2>
        <p className="scene-hook">{hook}</p>
        {context.length > 0 && <p className="scene-context">{context.join(' ')}</p>}
        <div className="scene-deadline"><span>AHORA TE TOCA</span><p>{pressure}</p></div>
        <div className="scene-stakes"><span>EN JUEGO</span>{stakes.map((stake) => <b key={stake.stat}>{stake.label}</b>)}</div>
      </article>

      <aside className="scene-sideline">
        <div className="scene-club"><img src={clubCrestUrl(club)} alt="" /><div><span>{club.shortName}</span><strong>{player.firstName}, el vestuario mira.</strong></div></div>
        <div className="scene-pulse"><span>TU PULSO</span><Pulse label="Confianza" value={player.stats.confidence} /><Pulse label="Disciplina" value={player.stats.discipline} /><Pulse label="Resistencia" value={player.stats.resilience} /></div>
        <div className={`identity-card identity-${identity.id}`}><span>TU FORMA DE DECIDIR</span><strong>{identity.count ? identity.label : 'Aún por descubrir'}</strong><p>{identity.count ? identity.description : 'Esta elección empieza a definirte.'}</p></div>
      </aside>
    </div>

    <div className="decision-prompt"><div><span>DECISIÓN</span><strong>No existe una salida perfecta.</strong></div><small>Pulsa 1–{event.choices.length} o elige una opción</small></div>
    <div className="decision-choices">{event.choices.map((choice, index) => {
      const archetype = choiceArchetype(choice)
      const level = riskLevel(choice.riskLabel)
      return <button type="button" className={`decision-choice choice-${archetype.id}`} aria-keyshortcuts={String(index + 1)} key={choice.id} onClick={() => onChoose(choice)}>
        <div className="choice-heading"><span>{archetype.label}</span><kbd>{index + 1}</kbd></div>
        <strong>{presentChoiceText(choice.text, event.title)}</strong>
        <p>{choice.visibleHint}</p>
        <div className="choice-impact">{choice.effects.map((effect, effectIndex) => <span className={effectDirection(effect, player) >= 0 ? 'positive' : 'negative'} key={`${effect.path}-${effectIndex}`}>{STAT_LABELS[effect.path]} {effectDirection(effect, player) >= 0 ? '↑' : '↓'}</span>)}</div>
        <div className="choice-risk"><span>{choice.riskLabel === 'Resultado impredecible' ? 'IMPREDECIBLE' : choice.riskLabel.toUpperCase()}</span><i>{[1, 2, 3, 4, 5].map((risk) => <b className={risk <= level ? 'active' : ''} key={risk} />)}</i></div>
      </button>
    })}</div>
  </section>
}

function Pulse({ label, value }: { label: string; value: number }) {
  return <div><small>{label}</small><i><b style={{ width: `${value}%` }} /></i><strong>{value}</strong></div>
}

function effectDirection(effect: StatEffect, player: CareerPlayer) {
  if (effect.operation === 'add') return effect.value
  if (effect.operation === 'multiply') return player.stats[effect.path] * effect.value - player.stats[effect.path]
  return effect.value - player.stats[effect.path]
}
