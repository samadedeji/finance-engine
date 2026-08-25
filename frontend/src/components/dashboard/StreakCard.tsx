import type { SalesStreak } from '../../api/types'

interface Props {
  streak: SalesStreak | null
}

export default function StreakCard({ streak }: Props) {
  if (!streak) return null

  return (
    <div className="rounded-lg border border-brand-100 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-brand-400">Sales Streak</p>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
          </svg>
        </span>
      </div>
      <p className="mt-2 text-3xl font-bold tracking-tight text-brand-900">
        {streak.current_streak}
        <span className="ml-1 text-sm font-medium text-brand-400">days</span>
      </p>
      <p className="mt-1 text-xs text-brand-400">
        {streak.longest_streak > streak.current_streak
          ? `Best streak: ${streak.longest_streak} days`
          : 'Personal best'}
      </p>
    </div>
  )
}
