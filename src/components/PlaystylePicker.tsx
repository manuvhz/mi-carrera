import { useCareerStore } from '../stores/career-store'

const STYLES = [
  { id: 'finisher', title: 'Finalizador', text: 'Vives del último toque. Frialdad y técnica cuando el arco se abre.', bonuses: ['+8 Técnica', '+3 Confianza'] },
  { id: 'engine', title: 'Motor del equipo', text: 'Corres por todos. Tu disciplina sostiene al equipo en los peores minutos.', bonuses: ['+8 Físico', '+3 Disciplina'] },
  { id: 'allrounder', title: 'Todoterreno', text: 'Un poco de todo, bien hecho. Te adaptas antes que el rival.', bonuses: ['+3 Talento', '+3 Técnica', '+3 Físico', '+3 Disciplina'] },
] as const

export function PlaystylePicker() {
  const player = useCareerStore((state) => state.player)
  const choose = useCareerStore((state) => state.choosePlaystyle)
  if (!player || player.activeFlags.some((flag) => flag.startsWith('playstyle:'))) return null
  return <section className="playstyle-panel">
    <p className="eyebrow">TU IDENTIDAD EN LA CANCHA</p>
    <h2>¿Qué clase de futbolista quieres ser?</h2>
    <p>Elige un estilo. La decisión modifica tus atributos de forma permanente.</p>
    <div className="playstyle-grid">
      {STYLES.map((style) => <button type="button" key={style.id} onClick={() => choose(style.id)}>
        <span className="playstyle-number">0{STYLES.indexOf(style) + 1}</span><h3>{style.title}</h3><p>{style.text}</p><div>{style.bonuses.map((bonus) => <em key={bonus}>{bonus}</em>)}</div>
      </button>)}
    </div>
  </section>
}
