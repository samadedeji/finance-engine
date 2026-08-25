import { useCallback, useEffect, useState } from 'react'
import { Tag, TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { api, auth, formatNaira } from '../api/client'
import type { CompetitorPrice } from '../api/types'

export default function Prices() {
  const business = auth.getBusiness()!
  const [prices, setPrices] = useState<CompetitorPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try { setPrices(await api.listPrices(business.id)) } catch { /* */ }
    setLoading(false)
  }, [business.id])

  useEffect(() => { void refresh() }, [refresh])

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    await api.addPrice({
      product_name: String(fd.get('product')),
      our_price: Number(fd.get('our_price')),
      competitor_name: String(fd.get('comp_name')) || undefined,
      competitor_price: Number(fd.get('comp_price')) || undefined,
    })
    setShowForm(false)
    void refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Price Tracker</h1>
          <p className="text-sm text-slate-500">Compare your prices with competitors.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
        >
          <Tag size={16} /> Add Product
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <input name="product" required placeholder="Product name" className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100" />
          <input name="our_price" type="number" required min={1} placeholder="Your price (₦)" className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100" />
          <input name="comp_name" placeholder="Competitor name (optional)" className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100" />
          <input name="comp_price" type="number" min={0} placeholder="Competitor price (₦)" className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100" />
          <div className="flex gap-2">
            <button type="submit" className="rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="py-8 text-center text-sm text-slate-400">Loading…</p>
      ) : prices.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center">
          <Tag size={32} className="mx-auto text-slate-300" />
          <p className="mt-3 text-sm text-slate-500">No products tracked yet. Add your first product.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {prices.map((p) => {
            const diff = p.competitor_price ? p.our_price - p.competitor_price : 0
            return (
              <div key={p.id} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50">
                  <Tag size={16} className="text-slate-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">{p.product_name}</p>
                  <p className="text-xs text-slate-400">{p.competitor_name ?? 'Unknown competitor'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">{formatNaira(p.our_price)}</p>
                  {p.competitor_price && (
                    <p className="text-xs text-slate-500">vs {formatNaira(p.competitor_price)}</p>
                  )}
                </div>
                <div className="flex h-8 w-8 items-center justify-center">
                  {diff > 0 ? (
                    <span className="flex items-center gap-0.5 text-xs font-medium text-rose-600">
                      <TrendingUp size={12} />+{formatNaira(diff)}
                    </span>
                  ) : diff < 0 ? (
                    <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-600">
                      <TrendingDown size={12} />{formatNaira(diff)}
                    </span>
                  ) : (
                    <Minus size={14} className="text-slate-300" />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
