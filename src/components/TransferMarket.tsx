import { clubCrestUrl, currentClubForPlayer } from '../content/real-clubs'
import { playerMarketScore, type TransferOffer } from '../game/transfer-market'
import type { CareerPlayer } from '../game/types'

interface TransferMarketProps {
  player: CareerPlayer
  offers: TransferOffer[]
  value?: string
  onChange: (clubId: string) => void
}

export function TransferMarket({ player, offers, value, onChange }: TransferMarketProps) {
  const currentClub = currentClubForPlayer(player)
  const firstContract = !currentClub
  const marketLevel = playerMarketScore(player)
  if (!offers.length) return null

  return <section className="transfer-market" aria-labelledby="transfer-title">
    <header className="transfer-heading">
      <div><span>{firstContract ? '06 · PRIMER CONTRATO' : '06 · MERCADO DE FICHAJES'}</span><h2 id="transfer-title">{firstContract ? 'Tu carrera profesional empieza aquí.' : 'El teléfono de tu agente no para.'}</h2><p>{firstContract ? 'La cantera elegida te ofrece el camino natural, pero hay otros proyectos atentos.' : 'No todos los escudos se interesan a la vez. Tu nivel, edad y reputación abren estas puertas.'}</p></div>
      <div className="agent-status"><i>●</i><span>AGENTE CONECTADO</span><strong>Nivel {marketLevel} · {offers.length} propuestas</strong></div>
    </header>

    <div className="transfer-options" role="radiogroup" aria-label="Destino para la próxima temporada">
      {currentClub && <button type="button" role="radio" aria-checked={value === currentClub.id} className={value === currentClub.id ? 'transfer-offer stay selected' : 'transfer-offer stay'} onClick={() => onChange(currentClub.id)}>
        <div className="offer-kicker"><span>QUEDARME</span><em>Continuidad</em></div>
        <div className="offer-club"><img src={clubCrestUrl(currentClub)} alt="" /><div><strong>{currentClub.shortName}</strong><small>{currentClub.league} · {currentClub.country}</small></div></div>
        <p>Defiende tu lugar y conserva lo que ya construiste en el vestuario.</p>
        <footer><span>ROL ACTUAL</span><strong>{player.clubRole}</strong></footer>
      </button>}
      {offers.map((offer) => <button type="button" role="radio" aria-checked={value === offer.club.id} className={value === offer.club.id ? 'transfer-offer selected' : 'transfer-offer'} key={offer.club.id} onClick={() => onChange(offer.club.id)}>
        <div className="offer-kicker"><span>{offer.interest}</span><em>{offer.levelChange > 0 ? `+${offer.levelChange} prestigio` : `${offer.levelChange} prestigio`}</em></div>
        <div className="offer-club"><img src={clubCrestUrl(offer.club)} alt="" /><div><strong>{offer.club.shortName}</strong><small>{offer.club.league} · {offer.club.country}</small></div></div>
        <p>{offer.role}. El proyecto de cantera está valorado en {offer.club.academy}/100.</p>
        <footer><span>OFERTA SEMANAL</span><strong>US$ {offer.salary.toLocaleString('es')}</strong></footer>
      </button>)}
    </div>
    <p className="transfer-hint"><span>✓</span> El destino marcado se aplicará al comenzar la próxima temporada.</p>
  </section>
}
