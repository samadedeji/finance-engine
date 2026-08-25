import { Flame } from 'lucide-react'
import type { SalesStreak } from '../../api/types'

interface Props {
  streak: SalesStreak | null
}

export default function StreakCard({ streak }: Props) {
  if (!streak) return null

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">Sales Streak</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
          <Flame size={18} />
        </span>
      </div>
      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
        {streak.current_streak}
        <span className="ml-1 text-sm font-medium text-slate-400">days</span>
      </p>
      <p className="mt-1 text-xs text-slate-500">
        {streak.longest_streak > streak.current_streak
          ? `Best streak: ${streak.longest_streak} days`
          : '🔥 Personal best!'}
      </p>
    </div>
  )
}
