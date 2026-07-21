import { TopBar } from '../components/ui.jsx'
import TournamentCard from '../components/TournamentCard.jsx'
import { tournaments } from '../data.js'

export default function Tournaments() {
  return (
    <div className="pb-4">
      <TopBar title="Tournaments" />
      <div className="px-4 pt-4">
        <p className="text-xs font-medium text-neutral-500 mb-3">
          {tournaments.length} tournaments available
        </p>
        <div className="space-y-4">
          {tournaments.map((t) => (
            <TournamentCard key={t.id} t={t} />
          ))}
        </div>
      </div>
    </div>
  )
}
