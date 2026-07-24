import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { readEvents } from './content-utils'

const events = await readEvents()
const rows = events.map((event) => `<tr><td>${event.id}</td><td>${event.title}</td><td>${event.stage}</td><td>${event.category}</td><td>${event.rarity}</td><td>${event.ageMin}-${event.ageMax}</td><td>${event.chainId ?? '—'}</td></tr>`).join('')
const html = `<!doctype html><html lang="es"><meta charset="utf-8"><title>Informe de contenido · Mi Carrera</title><style>body{font:14px system-ui;margin:32px;background:#07100b;color:#edf3ef}table{border-collapse:collapse;width:100%}th,td{padding:9px;border:1px solid #294034;text-align:left}th{color:#d7b96e;position:sticky;top:0;background:#0b2418}</style><h1>Mi Carrera · ${events.length} eventos</h1><table><thead><tr><th>ID</th><th>Título</th><th>Etapa</th><th>Categoría</th><th>Rareza</th><th>Edad</th><th>Cadena</th></tr></thead><tbody>${rows}</tbody></table></html>`
await mkdir(join(process.cwd(), 'outputs'), { recursive: true })
await writeFile(join(process.cwd(), 'outputs', 'content-report.html'), html, 'utf8')
console.log('Informe creado en outputs/content-report.html')
