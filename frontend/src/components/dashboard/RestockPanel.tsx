import { Package } from 'lucide-react'
import type { RestockReminder } from '../../api/types'

interface Props {
  reminders: RestockReminder[]
}

export default function RestockPanel({ reminders }: Props) {
  if (!reminders.length) return null

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Package size={16} className="text-blue-600" />
        <h2 className="text-base font-semibold text-slate-900">Restock Reminders</h2>
      </div>
      <ul className="mt-3 space-y-2">
        {reminders.map((r) => (
          <li key={r.category} className="rounded-xl bg-blue-50 px-3 py-2 text-sm text-blue-800">
            {r.message}
          </li>
        ))}
      </ul>
    </div>
  )
}
