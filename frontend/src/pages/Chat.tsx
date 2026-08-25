import { useEffect, useRef, useState } from 'react'
import { Mic, MicOff, Undo2 } from 'lucide-react'
import { api, auth } from '../api/client'
import type { ChatResponse, CategorySuggestion } from '../api/types'

interface Message {
  role: 'user' | 'bot'
  text: string
  data?: ChatResponse
}

const BASE_SUGGESTIONS = [
  'sold 3 sachets, 500 naira',
  'bought supplies 2000',
  'spent 1500 on transport',
  'paid 3000 for rent',
  "how's my week?",
  "how's my day?",
  "how's my month?",
  'undo',
]

export default function Chat() {
  const business = auth.getBusiness()!
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      text: `Hi ${business.name}. Tell me what you sold or spent, e.g. "sold 3 sachets, 500 naira", or ask "how's my week?". Type "undo" to remove your last entry.`,
    },
  ])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [categories, setCategories] = useState<CategorySuggestion[]>([])
  const [listening, setListening] = useState(false)
  const logRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    api.getCategories(business.id).then(setCategories).catch(() => {})
  }, [business.id])

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const startListening = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) {
      setMessages((m) => [...m, { role: 'bot', text: 'Voice input is not supported in this browser.' }])
      return
    }
    const recognition = new SR()
    recognition.lang = 'en-NG'
    recognition.interimResults = false
    recognition.onresult = (event: any) => {
      setInput(event.results[0][0].transcript)
      setListening(false)
    }
    recognition.onerror = () => setListening(false)
    recognition.onend = () => setListening(false)
    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
    setListening(false)
  }

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || sending) return
    setInput('')
    setSending(true)
    setMessages((m) => [...m, { role: 'user', text: trimmed }])
    try {
      const res = await api.chat(business.id, trimmed)
      setMessages((m) => [...m, { role: 'bot', text: res.reply, data: res }])
      api.getCategories(business.id).then(setCategories).catch(() => {})
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: 'bot', text: err instanceof Error ? err.message : 'Something went wrong.' },
      ])
    } finally {
      setSending(false)
    }
  }

  const categorySuggestions = categories.slice(0, 3).map((c) => `spent on ${c.category}`)
  const allSuggestions = [...new Set([...BASE_SUGGESTIONS, ...categorySuggestions])].slice(0, 10)

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold text-brand-900">Chat</h1>
        <p className="text-sm text-brand-500">Log transactions by typing, like WhatsApp.</p>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-brand-100 bg-white p-4">
        <div className="flex h-[32rem] flex-col gap-3 overflow-y-auto p-1" ref={logRef} data-testid="chat-log">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-lg px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'rounded-br-sm bg-brand-800 text-white'
                    : 'rounded-bl-sm bg-brand-50 text-brand-800'
                }`}
              >
                {m.text}
                {m.data?.transaction && (
                  <div className="mt-2 rounded bg-white/80 px-3 py-2 text-xs text-brand-600">
                    <span className="font-medium">Logged:</span>{' '}
                    {m.data.transaction.type === 'income' ? '+' : '-'}
                    {m.data.transaction.amount.toLocaleString()} ({m.data.transaction.category})
                  </div>
                )}
                {m.data?.transactions && (
                  <div className="mt-2 rounded bg-white/80 px-3 py-2 text-xs text-brand-600">
                    <span className="font-medium">{m.data.count} transactions logged</span>
                    {m.data.transactions.map((t, j) => (
                      <p key={j}>- {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()} ({t.category})</p>
                    ))}
                  </div>
                )}
                {m.data?.deleted && (
                  <div className="mt-2 rounded bg-rose-50 px-3 py-2 text-xs text-rose-600">
                    Removed: {m.data.deleted.amount.toLocaleString()} ({m.data.deleted.category})
                  </div>
                )}
                {m.data?.report && (
                  <div className="mt-2 space-y-1.5 border-t border-brand-100 pt-2">
                    <p className="text-xs font-medium text-brand-700">Summary</p>
                    {m.data.report.insights.map((insight, j) => (
                      <p key={j} className="text-xs text-brand-500">{insight}</p>
                    ))}
                    {m.data.report.advice.length > 0 && (
                      <p className="mt-1 text-xs font-medium text-brand-700">{m.data.report.advice[0]}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="rounded-lg rounded-bl-sm bg-brand-50 px-4 py-2 text-sm text-brand-400">
                <div className="spinner" />
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
            placeholder='e.g. sold 3 sachets, 500 naira'
            className="flex-1 rounded-lg border border-brand-200 px-3 py-2.5 text-sm text-brand-900 placeholder:text-brand-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
          <button
            type="button"
            onClick={listening ? stopListening : startListening}
            className={`rounded-lg px-3 py-2.5 transition-colors ${
              listening ? 'bg-rose-100 text-rose-600' : 'bg-brand-50 text-brand-500 hover:bg-brand-100'
            }`}
          >
            {listening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
          <button
            type="button"
            onClick={() => void send('undo')}
            className="rounded-lg bg-brand-50 px-3 py-2.5 text-brand-500 hover:bg-brand-100"
            title="Undo last transaction"
          >
            <Undo2 size={18} />
          </button>
          <button
            disabled={sending || !input.trim()}
            className="rounded-lg bg-brand-800 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </form>

        <div className="flex flex-wrap gap-1.5">
          {allSuggestions.map((s) => (
            <button
              key={s}
              onClick={() => void send(s)}
              className="rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-100"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
