import { useState } from 'react'
import { api, auth } from '../api/client'
import type { ChatResponse } from '../api/types'

interface Message {
  role: 'user' | 'bot'
  text: string
  data?: ChatResponse
}

const SUGGESTIONS = [
  'sold 3 sachets, 500 naira',
  'bought supplies 2000',
  'spent 1500 on transport',
  "how's my week?",
]

export default function Chat() {
  const business = auth.getBusiness()!
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      text: `Hi ${business.name}! Tell me what you sold or spent, e.g. "sold 3 sachets, 500 naira", or ask "how's my week?"`,
    },
  ])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || sending) return
    setInput('')
    setSending(true)
    setMessages((m) => [...m, { role: 'user', text: trimmed }])
    try {
      const res = await api.chat(business.id, trimmed)
      setMessages((m) => [...m, { role: 'bot', text: res.reply, data: res }])
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: 'bot', text: err instanceof Error ? err.message : 'Something went wrong.' },
      ])
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-lg">
          💬
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">FiEngine Assistant</h1>
          <p className="text-sm text-slate-500">Log transactions by chatting, like WhatsApp</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex h-96 flex-col gap-3 overflow-y-auto p-1" data-testid="chat-log">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'rounded-br-sm bg-brand-700 text-white'
                    : 'rounded-bl-sm bg-slate-100 text-slate-800'
                }`}
              >
                {m.text}
                {m.data?.report && (
                  <div className="mt-2 space-y-1 border-t border-slate-200 pt-2 text-xs text-slate-500">
                    {m.data.report.insights.map((i, j) => (
                      <p key={j}>• {i}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-sm bg-slate-100 px-4 py-2 text-sm text-slate-400">
                typing…
              </div>
            </div>
          )}
        </div>

        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            void send(input)
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. sold 3 sachets, 500 naira"
            className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          <button
            disabled={sending || !input.trim()}
            className="rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => void send(s)}
              className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-800 transition-colors hover:bg-brand-100"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}