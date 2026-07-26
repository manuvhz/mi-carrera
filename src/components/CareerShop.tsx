import { useState } from 'react'
import { formatCareerMoney } from '../game/career-systems'
import { SHOP_ITEMS, type ShopCategory } from '../game/shop'
import type { CareerPlayer } from '../game/types'

const CATEGORY_INFO: Record<ShopCategory, { icon: string; title: string; text: string }> = {
  development: { icon: '⚡', title: 'Desarrollo', text: 'Tecnología y herramientas que mejoran tu juego.' },
  staff: { icon: '💪', title: 'Staff', text: 'Profesionales permanentes para cuidar tu carrera.' },
  lifestyle: { icon: '💎', title: 'Lujo', text: 'Date el gusto y construye tu colección personal.' },
  legacy: { icon: '🌱', title: 'Legado', text: 'Invierte en tu gente y deja algo más grande que tus goles.' },
}

const CATEGORY_ORDER: ShopCategory[] = ['development', 'staff', 'lifestyle', 'legacy']

export function CareerShop({ player, onPurchase }: { player: CareerPlayer; onPurchase: (itemId: string) => void }) {
  const [latest, setLatest] = useState<string | null>(null)
  const owned = new Set(player.ownedItems ?? [])
  const buy = (itemId: string) => {
    onPurchase(itemId)
    setLatest(itemId)
  }

  return <main className="shop-page">
    <section className="shop-hero">
      <div><p className="eyebrow">CENTRO DE CARRERA</p><h1>Tu dinero ahora cambia tu historia.</h1><p>Contrata un equipo de élite, mejora tu preparación, compra lujos o devuelve algo al barrio. Cada compra queda para siempre en esta partida.</p></div>
      <div className="shop-wallet"><span>SALDO DISPONIBLE</span><strong>{formatCareerMoney(player.stats.finances, true)}</strong><small>{formatCareerMoney(player.careerEarnings ?? 0, true)} ganados en toda la carrera</small></div>
    </section>

    <div className="shop-summary" aria-label="Resumen de la tienda">
      <span><b>{owned.size}</b> compras</span><span><b>{SHOP_ITEMS.filter((item) => owned.has(item.id) && item.category === 'staff').length}</b> miembros del staff</span><span><b>{SHOP_ITEMS.length - owned.size}</b> objetivos pendientes</span>
    </div>

    {latest && owned.has(latest) && <div className="shop-success" role="status"><span>✓</span><div><strong>Compra completada</strong><p>La mejora ya forma parte de tu carrera.</p></div></div>}

    {CATEGORY_ORDER.map((category) => {
      const info = CATEGORY_INFO[category]
      const items = SHOP_ITEMS.filter((item) => item.category === category)
      return <section className={`shop-category shop-${category}`} key={category}>
        <header><span>{info.icon}</span><div><h2>{info.title}</h2><p>{info.text}</p></div></header>
        <div className="shop-grid">
          {items.map((item) => {
            const isOwned = owned.has(item.id)
            const affordable = player.stats.finances >= item.cost
            return <article className={isOwned ? 'shop-item owned' : 'shop-item'} key={item.id}>
              <div className="shop-item-icon" aria-hidden="true">{item.icon}</div>
              <div className="shop-item-copy"><h3>{item.title}</h3><p>{item.description}</p><small>{item.perk}</small></div>
              <div className="shop-item-action"><strong>{formatCareerMoney(item.cost, true)}</strong><button type="button" aria-label={isOwned ? `${item.title} adquirido` : affordable ? `Comprar ${item.title}` : `${item.title}: saldo insuficiente`} disabled={isOwned || !affordable} onClick={() => buy(item.id)}>{isOwned ? 'ADQUIRIDO' : affordable ? 'COMPRAR' : 'SIN FONDOS'}</button></div>
            </article>
          })}
        </div>
      </section>
    })}
  </main>
}
