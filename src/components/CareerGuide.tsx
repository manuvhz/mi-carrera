import { clubForPlayer } from '../content/real-clubs'
import { careerProjection, currentIdolatry, formPresentation, formatCareerMoney, idolatryTier, playerForm, playerOverall } from '../game/career-systems'
import type { CareerPlayer } from '../game/types'

export function CareerGuide({ player }: { player: CareerPlayer }) {
  const club = clubForPlayer(player)
  const overall = playerOverall(player)
  const form = formPresentation(playerForm(player))
  const idolatry = currentIdolatry(player)
  const rival = player.rival
  const guide = [
    { icon: '📊', title: 'Media', value: `${overall}/99`, text: 'Es tu nivel general: el promedio de Pegada, Velocidad, Visión y Mentalidad. Influye en tus goles, minutos, fichajes y premios.' },
    { icon: '🎯', title: 'Atributos', value: `PEG ${player.stats.technique} · VEL ${player.stats.fitness} · VIS ${player.stats.talent} · MEN ${player.stats.confidence}`, text: 'Pegada define el último toque; Velocidad ayuda a jugar más y llegar antes; Visión crea asistencias; Mentalidad sostiene la definición y las grandes noches.' },
    { icon: '🔋', title: 'Resistencia', value: `${player.stats.resilience}/100`, text: 'No suma a la Media. Te permite jugar más, sufrir menos fatiga y conservar mejor tu físico cuando seas veterano.' },
    { icon: '📈', title: 'Forma', value: `${form.arrows} ${form.label}`, text: 'Es tu racha actual. Cambia cada temporada según goles, asistencias, resultados y entrenamientos; una buena forma aumenta tu producción.' },
    { icon: '⭐', title: 'Fama', value: `${player.stats.reputation}/100`, text: 'Es tu cartel mundial. Los títulos, goles y premios la elevan; abre clubes grandes, mejores contratos y la convocatoria de tu Selección.' },
    { icon: '💰', title: 'Ganado', value: formatCareerMoney(player.careerEarnings ?? 0, true), text: `Es todo lo cobrado en contratos y premios. Tu saldo disponible es ${formatCareerMoney(player.stats.finances, true)} y sí puede gastarse en la tienda.` },
    { icon: '💙', title: 'Idolatría', value: player.currentClubId ? `${idolatry}/100 · ${idolatryTier(idolatry)}` : 'Aún no empieza', text: 'Se guarda por club. Sube con permanencia, goles, clásicos y títulos; marcharte reduce el vínculo, pero tu historia nunca desaparece.' },
    { icon: '✈️', title: 'El exterior', value: careerProjection(player, club.leagueId), text: 'Argentina, Brasil y las cinco grandes ligas están conectadas. Tu nivel, fama, agente e idiomas deciden qué ofertas aparecen.' },
    { icon: '🏆', title: 'Champions y copas', value: `${player.stats.trophies} títulos`, text: 'Cada año profesional simula liga y copa nacional. Los clubes clasificados juegan Libertadores, Sudamericana, Champions o Europa League; la élite puede pelear el Balón de Oro.' },
    { icon: '🛒', title: 'La tienda', value: `${player.ownedItems?.length ?? 0} compras`, text: 'Staff, desarrollo, lujos y legado. El staff modifica temporadas futuras; los objetos y proyectos quedan en tu colección para siempre.' },
    { icon: '🌱', title: 'El semillero', value: player.age < 16 ? `Estás en ${player.age < 13 ? 'Fútbol base' : 'Juveniles'}` : 'Etapa completada', text: 'Empiezas antes de los 16 y avanzas más rápido hasta el primer contrato. En esta etapa todavía no se genera idolatría profesional.' },
    { icon: '⚔️', title: 'El duelo', value: rival ? `${rival.name} · ${rival.goals} goles` : 'Rival por descubrir', text: 'Tu archirrival nace contigo y progresa cada temporada. Compiten por goles, asistencias, títulos, Selección, fama y el gran premio individual.' },
    { icon: '🧭', title: 'Decisiones y entrenamiento', value: `${player.eventHistory.length} recuerdos`, text: 'Las decisiones mueven atributos y vínculos. Las rutinas son rápidas; los retos interactivos cambian sus patrones y dan mejoras según tu resultado.' },
  ]

  return <main className="guide-page">
    <header className="guide-hero"><p className="eyebrow">MANUAL DEL FUTBOLISTA</p><h1>Entiende qué mueve tu carrera.</h1><p>Cada número tiene una función concreta. Esta guía usa los valores de tu partida para explicarte qué tienes y qué te falta.</p></header>
    <section className="guide-list" aria-label="Sistemas de la carrera">
      {guide.map((item) => <article key={item.title}><span className="guide-icon" aria-hidden="true">{item.icon}</span><div><header><h2>{item.title}</h2><strong>{item.value}</strong></header><p>{item.text}</p></div></article>)}
    </section>
  </main>
}
