import { REAL_CLUBS, clubCrestUrl } from '../content/real-clubs'

export function ClubPicker({ value, onChange }: { value?: string; onChange: (clubId: string) => void }) {
  return <div className="club-picker" role="radiogroup" aria-label="Club argentino favorito">
    {REAL_CLUBS.map((club) => <button
      type="button"
      role="radio"
      aria-checked={value === club.id}
      className={value === club.id ? 'club-option active' : 'club-option'}
      key={club.id}
      onClick={() => onChange(club.id)}
    >
      <img src={clubCrestUrl(club)} alt="" aria-hidden="true" />
      <span><strong>{club.shortName}</strong><small>{club.city}</small></span>
    </button>)}
  </div>
}
