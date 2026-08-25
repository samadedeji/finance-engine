import type { RestockReminder } from '../../api/types'

interface Props {
  reminders: RestockReminder[]
}

export default function RestockPanel({ reminders }: Props) {
  if (!reminders.length) return null

  return (
    <div className="rounded-lg border border-brand-100 bg-white p-5">
      <h2 className="text-sm font-semibold text-brand-900">Restock reminders</h2>
      <ul className="mt-3 space-y-2">
        {reminders.map((r) => (
          <li key={r.category} className="rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-700">
            {r.message}
          </li>
        ))}
      </ul>
    </div>
  )
}
