import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { NavLink, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { APP_CONFIG } from './config'
import { CareerPlayerCard } from './components/CareerPlayerCard'
import { ClubPicker } from './components/ClubPicker'
import { PlaystylePicker } from './components/PlaystylePicker'
import { SeasonRecap } from './components/SeasonRecap'
import { TrainingArcade } from './components/TrainingArcade'
import { clubById, clubCrestUrl, DEFAULT_CLUB_ID } from './content/real-clubs'
import { saveGameSchema } from './game/schemas'
import { presentChoiceText, presentEventDescription, presentEventTitle } from './game/presentation'
import type { EventChoice } from './game/types'
import { listSaves, saveCareer } from './persistence/database'
import { useCareerStore, type PlayerDraft } from './stores/career-store'

const STAGE_LABELS: Record<string, string> = {
  childhood: 'Infancia y barrio', academy: 'Formación juvenil', debut: 'Primeros pasos', consolidation: 'Consolidación',
  prime: 'Mejor etapa', veteran: 'Madurez', 'final-years': 'Últimos años', retirement: 'Retiro y legado',
}

function Mark() {
  return <span className="mark" aria-hidden="true"><span>MC</span></span>
}

function Shell({ children, minimal = false }: { children: ReactNode; minimal?: boolean }) {
  return <div className="app-shell">
    <header className="topbar">
      <NavLink className="brand" to="/"><Mark /><span>{APP_CONFIG.name}</span></NavLink>
      {!minimal && <nav className="topnav" aria-label="Navegación principal">
        <NavLink to="/carrera">Carrera</NavLink><NavLink to="/historial">Historia</NavLink><NavLink to="/estadisticas">Estadísticas</NavLink><NavLink to="/guardado">Guardado</NavLink>
      </nav>}
    </header>
    {children}
    {!minimal && <footer className="app-legal">Nombres y escudos pertenecen a sus titulares. Uso informativo en un proyecto de fans. <a href={`${import.meta.env.BASE_URL}creditos.html`} target="_blank" rel="noreferrer">Fuentes y licencias</a>.</footer>}
  </div>
}

function HomePage() {
  const navigate = useNavigate()
  const player = useCareerStore((state) => state.player)
  const load = useCareerStore((state) => state.load)
  const [checking, setChecking] = useState(true)
  useEffect(() => { if (!player) void load(1).finally(() => setChecking(false)); else setChecking(false) }, [load, player])
  return <Shell minimal>
    <main className="landing">
      <section className="hero-copy">
        <p className="eyebrow">SIMULADOR NARRATIVO DE FÚTBOL</p>
        <h1>Tu historia empieza<br />antes del <em>estadio.</em></h1>
        <p className="hero-lead">Cada decisión deja una huella. Empieza en el barrio, encuentra tu oportunidad y descubre qué clase de legado puedes construir.</p>
        <div className="hero-actions">
          <button className="button primary" onClick={() => navigate(player ? '/carrera' : '/crear')}>{player ? 'Continuar carrera' : 'Comenzar mi historia'} <span>→</span></button>
          {!checking && !player && <button className="button ghost" onClick={() => void load(1).then((ok) => ok && navigate('/carrera'))}>Cargar partida</button>}
        </div>
        <div className="promise-grid">
          <div><strong>500</strong><span>eventos escritos</span></div><div><strong>∞</strong><span>carreras posibles</span></div><div><strong>100%</strong><span>jugable sin conexión</span></div>
        </div>
      </section>
      <section className="hero-visual" aria-label="Un joven futbolista frente a su futuro">
        <div className="stadium-light" /><div className="field-lines" /><div className="player-silhouette"><div className="head" /><div className="body" /><div className="legs" /></div>
        <div className="story-card floating"><span>PRIMER RECUERDO</span><strong>Los guayos prestados</strong><p>“Prometiste devolverlos después de la final del barrio.”</p></div>
      </section>
    </main>
    <footer className="landing-footer"><span>Proyecto de fans · Escudos con fuente y licencia documentadas</span><span>v1.1 · Guardado local</span></footer>
  </Shell>
}

const defaults: PlayerDraft = {
  firstName: '', lastName: '', nickname: '', nationality: 'Argentina', region: 'San Salvador de Jujuy', gender: 'Masculino', age: 10,
  preferredFoot: 'Derecho', favoriteNumber: 10, favoriteClubId: DEFAULT_CLUB_ID, primaryPosition: 'Mediocampista', geographicOrigin: 'Barrio popular',
  economicBackground: 'Familia trabajadora con dificultades', footballLegacy: 'Sin conexiones con el fútbol',
  firstFootballEnvironment: 'Partidos en la calle', initialPersonality: 'Disciplinado',
}

function CreatePage() {
  const navigate = useNavigate()
  const createCareer = useCareerStore((state) => state.createCareer)
  const [draft, setDraft] = useState(defaults)
  const [mode, setMode] = useState<'create' | 'surprise' | 'hard'>('create')
  const update = <K extends keyof PlayerDraft>(key: K, value: PlayerDraft[K]) => setDraft((current) => ({ ...current, [key]: value }))
  const submit = (event: FormEvent) => {
    event.preventDefault()
    const finalDraft = mode === 'surprise' ? { ...draft, geographicOrigin: 'Familia migrante', economicBackground: 'Economía modesta pero estable', footballLegacy: 'Familia muy aficionada', firstFootballEnvironment: 'Equipo escolar', initialPersonality: 'Creativo' }
      : mode === 'hard' ? { ...draft, geographicOrigin: 'Zona rural', economicBackground: 'Recursos muy limitados', footballLegacy: 'Familia opuesta al fútbol', firstFootballEnvironment: 'Entrenamiento con un familiar', initialPersonality: 'Resiliente' } : draft
    createCareer(finalDraft)
    navigate('/origen')
  }
  return <Shell minimal><main className="form-page">
    <div className="step-line"><span className="active">1</span><i /><span>2</span><i /><span>3</span></div>
    <p className="eyebrow">CAPÍTULO CERO</p><h1>Crea a quien llevará la historia.</h1><p className="muted intro">No estás eligiendo estadísticas perfectas. Estás definiendo el lugar desde donde empezarás a luchar.</p>
    <form onSubmit={submit} className="career-form">
      <div className="mode-picker">
        {([['create', 'Crear mi historia', 'Tú decides cada detalle.'], ['surprise', 'Sorpréndeme', 'Un origen equilibrado por semilla.'], ['hard', 'Camino difícil', 'Menos recursos, otras fortalezas.']] as const).map(([id, title, text]) =>
          <button type="button" key={id} className={mode === id ? 'mode active' : 'mode'} onClick={() => setMode(id)}><strong>{title}</strong><span>{text}</span></button>)}
      </div>
      <section className="form-section"><h2>Identidad</h2><div className="form-grid">
        <label>Nombre<input required value={draft.firstName} onChange={(e) => update('firstName', e.target.value)} placeholder="Ej. Adrián" /></label>
        <label>Apellido<input required value={draft.lastName} onChange={(e) => update('lastName', e.target.value)} placeholder="Ej. Montoya" /></label>
        <label>Apodo opcional<input value={draft.nickname} onChange={(e) => update('nickname', e.target.value)} placeholder="Ej. El Zurdo" /></label>
        <label>Género<select value={draft.gender} onChange={(e) => update('gender', e.target.value)}><option>Masculino</option><option>Femenino</option><option>No binario</option></select></label>
        <label>Nacionalidad<select value={draft.nationality} onChange={(e) => update('nationality', e.target.value)}><option>Argentina</option><option>Colombia</option><option>Uruguay</option><option>Chile</option><option>Paraguay</option></select></label>
        <label>Ciudad de origen<select value={draft.region} onChange={(e) => update('region', e.target.value)}><option>San Salvador de Jujuy</option><option>Buenos Aires</option><option>Córdoba</option><option>Rosario</option><option>La Plata</option></select></label>
        <label>Edad inicial<select value={draft.age} onChange={(e) => update('age', Number(e.target.value))}><option>9</option><option>10</option><option>11</option><option>12</option></select></label>
        <label>Posición<select value={draft.primaryPosition} onChange={(e) => update('primaryPosition', e.target.value)}><option>Portero</option><option>Defensa</option><option>Mediocampista</option><option>Extremo</option><option>Delantero</option></select></label>
        <label>Pie dominante<select value={draft.preferredFoot} onChange={(e) => update('preferredFoot', e.target.value as PlayerDraft['preferredFoot'])}><option>Derecho</option><option>Izquierdo</option><option>Ambos</option></select></label>
        <label>Número favorito<input type="number" min="1" max="99" value={draft.favoriteNumber} onChange={(e) => update('favoriteNumber', Number(e.target.value))} /></label>
      </div></section>
      <section className="form-section club-form-section"><p className="eyebrow">FÚTBOL ARGENTINO</p><h2>¿Qué escudo imaginas en tu camiseta?</h2><p className="muted">Será tu club soñado durante la infancia y tu primera oportunidad profesional al cumplir 16 años.</p><ClubPicker value={draft.favoriteClubId} onChange={(clubId) => update('favoriteClubId', clubId)} /></section>
      {mode === 'create' && <section className="form-section"><h2>Origen</h2><div className="form-grid">
        <ChoiceSelect label="Entorno geográfico" value={draft.geographicOrigin} onChange={(v) => update('geographicOrigin', v)} options={['Barrio popular', 'Zona rural', 'Pueblo pequeño', 'Ciudad intermedia', 'Zona urbana acomodada', 'Familia migrante']} />
        <ChoiceSelect label="Situación económica" value={draft.economicBackground} onChange={(v) => update('economicBackground', v)} options={['Recursos muy limitados', 'Familia trabajadora con dificultades', 'Economía modesta pero estable', 'Recursos suficientes', 'Familia acomodada']} />
        <ChoiceSelect label="Legado futbolístico" value={draft.footballLegacy} onChange={(v) => update('footballLegacy', v)} options={['Sin conexiones con el fútbol', 'Familiar exfutbolista', 'Familiar entrenador', 'Hermano futbolista', 'Familia muy aficionada', 'Familia opuesta al fútbol']} />
        <ChoiceSelect label="Primer entorno futbolístico" value={draft.firstFootballEnvironment} onChange={(v) => update('firstFootballEnvironment', v)} options={['Partidos en la calle', 'Torneos de barrio', 'Equipo escolar', 'Escuela municipal', 'Club aficionado', 'Academia privada', 'Fútbol sala']} />
        <ChoiceSelect label="Personalidad inicial" value={draft.initialPersonality} onChange={(v) => update('initialPersonality', v)} options={['Disciplinado', 'Ambicioso', 'Creativo', 'Competitivo', 'Rebelde', 'Tranquilo', 'Líder', 'Inseguro', 'Leal', 'Impulsivo']} />
      </div></section>}
      <button className="button primary submit" type="submit">Construir mi origen <span>→</span></button>
    </form>
  </main></Shell>
}

function ChoiceSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <label>{label}<select value={value} onChange={(e) => onChange(e.target.value)}>{options.map((option) => <option key={option}>{option}</option>)}</select></label>
}

function OriginPage() {
  const player = useCareerStore((state) => state.player)
  const navigate = useNavigate()
  if (!player) return <Navigate to="/crear" replace />
  const club = clubById(player.favoriteClubId)
  return <Shell minimal><main className="origin-page">
    <div className="step-line"><span>1</span><i /><span className="active">2</span><i /><span>3</span></div>
    <p className="eyebrow">TU PRIMERA PÁGINA</p><h1>Antes del estadio estaba {player.region}.</h1>
    <div className="origin-story"><p>Tenías <strong>{player.age} años</strong> cuando el balón empezó a ordenar tus días. Creciste en <strong>{player.geographicOrigin.toLowerCase()}</strong>, dentro de una <strong>{player.economicBackground.toLowerCase()}</strong>.</p>
      <p>Tu primer campo fueron los <strong>{player.firstFootballEnvironment.toLowerCase()}</strong>. Sin saberlo, ahí aprendiste que ser <strong>{player.initialPersonality.toLowerCase()}</strong> podía abrir unas puertas y cerrar otras.</p>
      <blockquote>“Antes de convertirte en leyenda, tienes que encontrar una oportunidad.”</blockquote></div>
    <div className="origin-club"><img src={clubCrestUrl(club)} alt={`Escudo de ${club.name}`} /><div><span>EL ESCUDO QUE TE INSPIRA</span><strong>{club.name}</strong><small>{club.city} · {club.league}</small></div></div>
    <div className="origin-facts"><span>{player.primaryPosition}</span><span>Pie {player.preferredFoot.toLowerCase()}</span><span>Dorsal soñado {player.favoriteNumber}</span><span>{player.footballLegacy}</span></div>
    <button className="button primary" onClick={() => navigate('/carrera')}>Empezar la carrera <span>→</span></button>
  </main></Shell>
}

function CareerGuard({ children }: { children: ReactNode }) {
  const player = useCareerStore((state) => state.player)
  return player ? children : <Navigate to="/" replace />
}

function CareerPage() {
  const { player, currentEvent, lastResult, eventsThisYear, drawEvent, resolveChoice, continueAfterResult } = useCareerStore()
  const navigate = useNavigate()
  if (!player) return null
  const retired = player.careerStage === 'retirement'
  const canAdvance = eventsThisYear >= 2
  return <Shell><main className="dashboard">
    <CareerPlayerCard player={player} />
    <PlaystylePicker />
    {retired ? <RetirementPanel /> : currentEvent ? <EventCard onChoose={resolveChoice} /> : lastResult ? <ResultCard result={lastResult} onContinue={continueAfterResult} /> : <section className="next-event-panel">
      <div className="pitch-icon">✦</div><p className="eyebrow">PRÓXIMO ACONTECIMIENTO</p><h2>{eventsThisYear === 0 ? 'La temporada está por escribir.' : 'Todavía quedan decisiones por tomar.'}</h2><p>Los eventos disponibles dependen de tu edad, tu origen y todo lo que recuerde tu historia.</p>
      <div className="event-actions"><button className="button primary" onClick={drawEvent}>Descubrir acontecimiento <span>→</span></button>{canAdvance && <button className="button ghost" onClick={() => navigate('/resumen-temporada')}>Cerrar el año</button>}</div><small>{eventsThisYear}/2 acontecimientos esenciales resueltos</small>
    </section>}
    <TrainingArcade />
    <section className="dashboard-bottom"><div className="mini-panel"><span>HUELLA DE ORIGEN</span><strong>{player.geographicOrigin}</strong><p>{player.stats.community >= 60 ? 'Tu comunidad sigue apareciendo en los momentos decisivos.' : 'La distancia con tu origen comienza a sentirse.'}</p></div><div className="mini-panel"><span>ÚLTIMO RECUERDO</span><strong>{player.eventHistory.at(-1) ? presentEventTitle(player.eventHistory.at(-1)!.title) : 'La historia apenas comienza'}</strong><p>{player.eventHistory.at(-1)?.result.slice(0, 105) ?? 'Tu primera decisión todavía te espera.'}…</p></div></section>
  </main></Shell>
}

function SeasonRecapPage() {
  const { player, seed, advanceYear } = useCareerStore()
  const navigate = useNavigate()
  if (!player) return <Navigate to="/" replace />
  const continueCareer = () => { advanceYear(); navigate('/carrera') }
  return <Shell><SeasonRecap player={player} seed={seed} onAdvance={continueCareer} /></Shell>
}

function EventCard({ onChoose }: { onChoose: (choice: EventChoice) => void }) {
  const event = useCareerStore((state) => state.currentEvent)!
  return <section className="event-card"><div className="event-meta"><span>{event.category}</span><span>{event.rarity === 'legendary' ? '✦ Legendario' : STAGE_LABELS[event.stage]}</span></div><h2>{presentEventTitle(event.title)}</h2><p className="event-description">{presentEventDescription(event.description, event.title)}</p><div className="choices">{event.choices.map((choice, index) => <button key={choice.id} onClick={() => onChoose(choice)}><div className="choice-copy"><b>{String(index + 1).padStart(2, '0')}</b><div><strong>{presentChoiceText(choice.text, event.title)}</strong><span>{choice.visibleHint}</span></div></div><em>{shortRiskLabel(choice.riskLabel)}</em></button>)}</div></section>
}

function shortRiskLabel(label: EventChoice['riskLabel']) { return label === 'Resultado impredecible' ? 'Impredecible' : label }

function ResultCard({ result, onContinue }: { result: string; onContinue: () => void }) { return <section className="result-card"><span className="result-mark">✓</span><p className="eyebrow">CONSECUENCIA</p><h2>La historia recuerda tu decisión.</h2><p>{result}</p><button className="button primary" onClick={onContinue}>Continuar <span>→</span></button></section> }

function RetirementPanel() {
  const player = useCareerStore((state) => state.player)!
  const score = Math.min(100, Math.round(player.stats.reputation * .45 + player.stats.trophies * 4 + player.stats.community * .2 + player.stats.resilience * .25))
  const archetype = score > 82 ? 'Leyenda de una generación' : score > 65 ? 'Profesional respetado' : score > 48 ? 'Veterano del barrio' : 'Una carrera reconstruida'
  return <section className="retirement-card"><p className="eyebrow">EPÍLOGO</p><h2>{archetype}</h2><p>De {player.region} a la última ovación: tu carrera no se explica solo con resultados. Las promesas, las personas y las veces que volviste a empezar también forman tu legado.</p><div className="legacy-score"><strong>{score}</strong><span>LEGADO</span></div><div className="retirement-stats"><span><b>{player.stats.matches}</b> partidos</span><span><b>{player.stats.goals}</b> goles</span><span><b>{player.stats.trophies}</b> títulos</span><span><b>{player.eventHistory.length}</b> decisiones</span></div></section>
}

function HistoryPage() {
  const player = useCareerStore((state) => state.player)!
  return <Shell><main className="content-page"><p className="eyebrow">MEMORIA DE CARRERA</p><h1>Tu historia, decisión por decisión.</h1>{!player.eventHistory.length ? <Empty text="Aún no has resuelto ningún acontecimiento." /> : <div className="timeline">{[...player.eventHistory].reverse().map((entry) => <article key={`${entry.eventId}-${entry.date}`}><div className="timeline-age">{entry.age}<small>años</small></div><div><span>Temporada {entry.season}</span><h2>{presentEventTitle(entry.title)}</h2><strong>{presentChoiceText(entry.choiceText, entry.title)}</strong><p>{entry.result}</p></div></article>)}</div>}</main></Shell>
}

function StatsPage() {
  const player = useCareerStore((state) => state.player)!
  const stats = player.stats
  return <Shell><main className="content-page"><p className="eyebrow">RADIOGRAFÍA DE CARRERA</p><h1>Lo visible y lo que te sostiene.</h1><div className="big-stats"><StatNumber value={stats.matches} label="Partidos" /><StatNumber value={stats.goals} label="Goles" /><StatNumber value={stats.assists} label="Asistencias" /><StatNumber value={stats.trophies} label="Títulos" /></div><section className="attributes"><h2>Atributos</h2>{(['talent', 'technique', 'fitness', 'discipline', 'confidence', 'resilience', 'reputation', 'family', 'community'] as const).map((key) => <div key={key}><span>{{ talent: 'Talento', technique: 'Técnica', fitness: 'Estado físico', discipline: 'Disciplina', confidence: 'Confianza', resilience: 'Resiliencia', reputation: 'Reputación', family: 'Familia', community: 'Comunidad' }[key]}</span><i><b style={{ width: `${stats[key]}%` }} /></i><strong>{stats[key]}</strong></div>)}</section></main></Shell>
}

function StatNumber({ value, label }: { value: number; label: string }) { return <div><strong>{value}</strong><span>{label}</span></div> }

function SavesPage() {
  const { player, seed, load } = useCareerStore()
  const [saves, setSaves] = useState<Awaited<ReturnType<typeof listSaves>>>([])
  const fileRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const refresh = () => void listSaves().then(setSaves)
  useEffect(refresh, [])
  const saveIn = async (slot: number) => { if (!player) return; await saveCareer(slot, { version: APP_CONFIG.saveVersion, seed, player, updatedAt: new Date().toISOString() }); refresh() }
  const exportSave = () => { if (!player) return; const blob = new Blob([JSON.stringify({ version: APP_CONFIG.saveVersion, seed, player, updatedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' }); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `mi-carrera-${player.firstName.toLowerCase()}.json`; link.click(); URL.revokeObjectURL(link.href) }
  const importSave = async (file: File) => { const parsed = saveGameSchema.parse(JSON.parse(await file.text())); await saveCareer(1, parsed); await load(1); refresh(); navigate('/carrera') }
  return <Shell><main className="content-page"><p className="eyebrow">GUARDADO LOCAL</p><h1>Tus carreras viven en este dispositivo.</h1><p className="muted">Las partidas se guardan en IndexedDB dentro de este navegador. Exporta una copia si vas a cambiar de equipo o borrar los datos del sitio.</p><div className="save-grid">{[1, 2, 3].map((slot) => { const save = saves.find((item) => item.slot === slot); return <article key={slot}><span>ESPACIO {slot}</span>{save ? <><h2>{save.player.firstName} {save.player.lastName}</h2><p>{save.player.age} años · Temporada {save.player.season}<br />{new Date(save.updatedAt).toLocaleString('es')}</p><button className="button ghost" onClick={() => void load(slot).then(() => navigate('/carrera'))}>Cargar</button></> : <><h2>Espacio vacío</h2><p>Guarda aquí una copia de la carrera actual.</p></>}<button className="text-button" onClick={() => void saveIn(slot)}>Guardar aquí</button></article> })}</div><div className="file-actions"><button className="button ghost" onClick={exportSave}>Exportar JSON</button><button className="button ghost" onClick={() => fileRef.current?.click()}>Importar partida</button><input ref={fileRef} hidden type="file" accept="application/json" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importSave(file) }} /></div></main></Shell>
}

function Empty({ text }: { text: string }) { return <div className="empty"><span>○</span><p>{text}</p></div> }

export default function App() {
  return <Routes>
    <Route path="/" element={<HomePage />} /><Route path="/crear" element={<CreatePage />} /><Route path="/origen" element={<OriginPage />} />
    <Route path="/carrera" element={<CareerGuard><CareerPage /></CareerGuard>} /><Route path="/resumen-temporada" element={<CareerGuard><SeasonRecapPage /></CareerGuard>} /><Route path="/historial" element={<CareerGuard><HistoryPage /></CareerGuard>} />
    <Route path="/estadisticas" element={<CareerGuard><StatsPage /></CareerGuard>} /><Route path="/guardado" element={<CareerGuard><SavesPage /></CareerGuard>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
}
