import { useState } from 'react'
import { FOOTBALL_REGIONS, REAL_CLUBS, clubById, clubCrestUrl, type FootballRegionId } from '../content/real-clubs'

export function ClubPicker({ value, onChange }: { value?: string; onChange: (clubId: string) => void }) {
  const initialRegion = clubById(value).leagueId
  const [regionId, setRegionId] = useState<FootballRegionId>(initialRegion)
  const clubs = REAL_CLUBS.filter((club) => club.leagueId === regionId)
  const region = FOOTBALL_REGIONS.find((item) => item.id === regionId)!

  return <div className="world-club-picker">
    <div className="league-tabs" role="tablist" aria-label="País de inicio">
      {FOOTBALL_REGIONS.map((item) => <button
        type="button"
        role="tab"
        aria-selected={regionId === item.id}
        className={regionId === item.id ? 'active' : ''}
        key={item.id}
        onClick={() => setRegionId(item.id)}
      ><span>{item.flag}</span><strong>{item.name}</strong><small>{item.league}</small></button>)}
    </div>
    <div className="club-picker-heading"><span>{region.flag}</span><div><strong>{region.league}</strong><small>Elige la cantera que abrirá tu primera puerta profesional</small></div></div>
    <div className="club-picker" role="radiogroup" aria-label={`Club de inicio en ${region.name}`}>
      {clubs.map((club) => <button
        type="button"
        role="radio"
        aria-checked={value === club.id}
        className={value === club.id ? 'club-option active' : 'club-option'}
        key={club.id}
        onClick={() => onChange(club.id)}
      >
        <img src={clubCrestUrl(club)} alt="" aria-hidden="true" />
        <span><strong>{club.shortName}</strong><small>{club.city} · Cantera {club.academy}</small></span>
      </button>)}
    </div>
  </div>
}
