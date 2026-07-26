import { careerDecisionIdentity } from '../game/experience'
import type { DecisionOutcome as DecisionOutcomeData } from '../game/experience'
import { presentChoiceText, presentEventResult, presentEventTitle } from '../game/presentation'
import type { CareerPlayer } from '../game/types'
import { APP_CONFIG } from '../config'

const OUTCOME_HEADLINES = {
  victory: 'La apuesta salió a tu favor.',
  bittersweet: 'Ganaste algo. Algo quedó atrás.',
  setback: 'La decisión pesa, pero la carrera sigue.',
} as const

export function DecisionOutcome({ outcome, player, onContinue }: { outcome: DecisionOutcomeData; player: CareerPlayer; onContinue: () => void }) {
  const identity = careerDecisionIdentity(player.eventHistory)
  return <section className={`decision-outcome outcome-${outcome.tone}`} aria-labelledby="outcome-title">
    <div className="outcome-stamp"><span>DECISIÓN TOMADA</span><strong>{outcome.archetype.label}</strong></div>
    <div className="outcome-layout">
      <article>
        <p className="eyebrow">CONSECUENCIA · {outcome.eventCategory}</p>
        <h2 id="outcome-title">{OUTCOME_HEADLINES[outcome.tone]}</h2>
        <div className="outcome-choice"><span>ELEGISTE</span><strong>{presentChoiceText(outcome.choiceText, outcome.eventTitle)}</strong></div>
        <blockquote>{presentEventResult(outcome.result, outcome.eventTitle)}</blockquote>
      </article>
      <aside className="outcome-changes">
        <span>LO QUE CAMBIÓ</span>
        {outcome.changes.length ? outcome.changes.map((change) => <div className={change.delta > 0 ? 'gain' : 'loss'} key={change.stat}><div><strong>{change.label}</strong><small>{change.before} → {change.after}</small></div><b>{change.delta > 0 ? '+' : ''}{change.delta}</b></div>) : <p>La consecuencia todavía no se refleja en una cifra.</p>}
      </aside>
    </div>
    <div className="outcome-memory"><div><span>NUEVO RECUERDO</span><strong>{presentEventTitle(outcome.eventTitle)}</strong></div><div><span>TU IDENTIDAD SE INCLINA HACIA</span><strong>{identity.label}</strong></div><div><span>RIESGO ASUMIDO</span><strong>{outcome.riskLabel}</strong></div></div>
    <div className="outcome-auto"><span>La siguiente escena aparece automáticamente</span><i><b style={{ animationDuration: `${APP_CONFIG.outcomeAutoAdvanceMs}ms` }} /></i></div>
    <button className="button primary" onClick={onContinue}>Siguiente ahora <span>→</span></button>
  </section>
}
