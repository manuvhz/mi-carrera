import { readEvents } from './content-utils'
import { seededRandom, stageForAge } from '../src/game/engine'

const events = await readEvents()
const appearances = new Map<string, number>()
const retirementAges: number[] = []
const debutAges: number[] = []
const archetypes = new Map<string, number>()
let professionals = 0
let internationals = 0
let titleWinners = 0
let injuryTotal = 0
let repeatedEvents = 0
let impossibleStates = 0

for (let career = 0; career < 10_000; career += 1) {
  const random = seededRandom(81_337 + career * 97)
  const seen = new Set<string>()
  const professional = random() < .78
  if (professional) professionals += 1
  const debutAge = professional ? 16 + Math.floor(random() * 5) : 0
  if (debutAge) debutAges.push(debutAge)
  let reputation = 3
  let resilience = 45 + Math.round(random() * 20)
  let titles = 0
  let injuries = 0
  for (let age = 9 + Math.floor(random() * 4); age <= 40; age += 1) {
    const stage = stageForAge(age)
    const count = stage === 'childhood' || stage === 'academy' ? 2 + Math.floor(random() * 3) : 2 + Math.floor(random() * 4)
    for (let slot = 0; slot < count; slot += 1) {
      const eligible = events.filter((event) => event.stage === stage && age >= event.ageMin && age <= event.ageMax && !seen.has(event.id))
      if (!eligible.length) continue
      const total = eligible.reduce((sum, event) => sum + event.baseWeight, 0)
      let cursor = random() * total
      const selected = eligible.find((event) => ((cursor -= event.baseWeight) <= 0)) ?? eligible[eligible.length - 1]
      if (seen.has(selected.id)) repeatedEvents += 1
      seen.add(selected.id); appearances.set(selected.id, (appearances.get(selected.id) ?? 0) + 1)
      reputation += selected.rarity === 'legendary' ? 4 : selected.rarity === 'rare' ? 2 : 1
      resilience += random() > .55 ? 1 : -1
      if (professional && age >= debutAge && random() < .018 + reputation / 10_000) titles += 1
      if (random() < .035) injuries += 1
    }
  }
  const retirementAge = 35 + Math.floor(random() * 6); retirementAges.push(retirementAge)
  const international = professional && random() < Math.min(.62, reputation / 170)
  if (international) internationals += 1
  if (titles > 0) titleWinners += 1
  injuryTotal += injuries
  if (reputation < 0 || resilience < 0 || debutAge > retirementAge) impossibleStates += 1
  const legacy = reputation + resilience * .3 + titles * 7 + (international ? 8 : 0)
  const archetype = legacy > 195 ? 'Leyenda mundial' : legacy > 155 ? 'Profesional respetado' : resilience > 60 ? 'Carrera reconstruida' : 'Veterano del barrio'
  archetypes.set(archetype, (archetypes.get(archetype) ?? 0) + 1)
}

const never = events.filter((event) => !appearances.has(event.id))
const frequent = [...appearances.entries()].sort((a,b) => b[1]-a[1]).slice(0,10)
console.log('INFORME DE 10.000 CARRERAS')
console.log(`Edad promedio de debut: ${(debutAges.reduce((a,b)=>a+b,0)/debutAges.length).toFixed(2)}`)
console.log(`Edad promedio de retiro: ${(retirementAges.reduce((a,b)=>a+b,0)/retirementAges.length).toFixed(2)}`)
console.log(`Llegan al profesionalismo: ${(professionals / 100).toFixed(2)}%`)
console.log(`Juegan para la selección: ${(internationals / 100).toFixed(2)}%`)
console.log(`Ganan al menos un título: ${(titleWinners / 100).toFixed(2)}%`)
console.log(`Lesiones promedio: ${(injuryTotal / 10_000).toFixed(2)}`)
console.log(`Estados imposibles: ${impossibleStates}; eventos repetidos: ${repeatedEvents}`)
console.log(`Eventos que nunca aparecen: ${never.length}`)
console.log('Eventos más frecuentes:', Object.fromEntries(frequent))
console.log('Arquetipos finales:', Object.fromEntries(archetypes))
