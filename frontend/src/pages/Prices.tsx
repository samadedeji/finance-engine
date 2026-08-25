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
    await api.addPrice({ product_name: String(fd.get('product')), our_price: Number(fd.get('our_price')), competitor_name: String(fd.get('comp_name')) || undefined, competitor_price: Number(fd.get('comp_price')) || undefined })
    setShowForm(false)
    void refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-900">Price tracker</h1>
          <p className="text-sm text-brand-500">Compare your prices with competitors.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 rounded-lg bg-brand-800 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-900">
          <Tag size={16} /> Add product
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="rounded-lg border border-brand-100 bg-white p-5 space-y-3">
          <input name="product" required placeholder="Product name" className="w-full rounded-lg border border-brand-200 px-3 py-2.5 text-sm text-brand-900 placeholder:text-brand-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
          <input name="our_price" type="number" required min={1} placeholder="Your price" className="w-full rounded-lg border border-brand-200 px-3 py-2.5 text-sm text-brand-900 placeholder:text-brand-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
          <input name="comp_name" placeholder="Competitor name (optional)" className="w-full rounded-lg border border-brand-200 px-3 py-2.5 text-sm text-brand-900 placeholder:text-brand-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
          <input name="comp_price" type="number" min={0} placeholder="Competitor price" className="w-full rounded-lg border border-brand-200 px-3 py-2.5 text-sm text-brand-900 placeholder:text-brand-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
          <div className="flex gap-2">
            <button type="submit" className="rounded-lg bg-brand-800 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-900">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-brand-200 px-4 py-2 text-sm text-brand-600 hover:bg-brand-50">Cancel</button>
          </div>
        </form>
      )}

      {loading ? <div className="py-8 text-center"><div className="spinner mx-auto" /></div> : prices.length === 0 ? (
        <div className="rounded-lg border border-dashed border-brand-200 p-10 text-center">
          <p className="text-sm text-brand-500">No products tracked yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {prices.map((p) => {
            const diff = p.competitor_price ? p.our_price - p.competitor_price : 0
            return (
              <div key={p.id} className="flex items-center gap-4 rounded-lg border border-brand-100 bg-white px-5 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50">
                  <Tag size={14} className="text-brand-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-brand-900">{p.product_name}</p>
                  <p className="text-xs text-brand-400">{p.competitor_name || 'Unknown competitor'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-brand-900">{formatNaira(p.our_price)}</p>
                  {p.competitor_price && <p className="text-xs text-brand-400">vs {formatNaira(p.competitor_price)}</p>}
                </div>
                <div className="flex h-8 w-8 items-center justify-center">
                  {diff > 0 ? <span className="flex items-center gap-0.5 text-xs font-medium text-rose-600"><TrendingUp size={12} />+{formatNaira(diff)}</span>
                    : diff < 0 ? <span className="flex items-center gap-0.5 text-xs font-medium text-emerald-600"><TrendingDown size={12} />{formatNaira(diff)}</span>
                    : <Minus size={14} className="text-brand-300" />}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
