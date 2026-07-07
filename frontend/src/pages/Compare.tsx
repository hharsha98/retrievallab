/** Compare — the naive answer vs the advanced answer, side by side, same question. */
import { useState } from 'react'
import { api, type QueryTrace } from '../lib/api'

function Answer({ text }: { text: string }) {
  return (
    <p className="text-sm leading-relaxed text-zinc-200">
      {text.split(/(\[\d+\])/g).map((p, i) =>
        /^\[\d+\]$/.test(p)
          ? <span key={i} className="mx-0.5 rounded bg-emerald-400/15 px-1.5 font-mono text-[11px] text-accent">{p}</span>
          : <span key={i}>{p}</span>)}
    </p>
  )
}

export default function Compare() {
  const [q, setQ] = useState('Which safety certification does the Atlas-7 hold for working next to people?')
  const [trace, setTrace] = useState<QueryTrace | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function run() {
    if (!q.trim() || busy) return
    setBusy(true); setError(''); setTrace(null)
    try {
      setTrace(await api<QueryTrace>('/api/query', { method: 'POST', body: JSON.stringify({ question: q }) }))
    } catch (e) { setError(e instanceof Error ? e.message.slice(0, 200) : String(e)) } finally { setBusy(false) }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-500">compare</p>
      <h2 className="mt-1 text-2xl font-semibold text-zinc-100">Naive vs advanced, same question.</h2>
      <p className="mt-2 max-w-2xl text-sm text-zinc-500">
        Naive = pure vector search over content-only embeddings. Advanced = contextual
        embeddings + hybrid + HyDE + cross-encoder rerank.
      </p>

      <form onSubmit={(e) => { e.preventDefault(); run() }} className="mt-6 flex gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} disabled={busy}
          className="flex-1 rounded-md border border-edge bg-panel px-4 py-2.5 text-sm text-zinc-100 outline-none focus:border-accent/60" />
        <button disabled={busy || !q.trim()} className="rounded-md bg-accent px-5 text-sm font-medium text-zinc-950 transition enabled:hover:brightness-110 disabled:opacity-40">
          {busy ? 'Running…' : 'Compare'}
        </button>
      </form>
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      {trace && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-edge bg-panel p-5">
            <h3 className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">naive · vector only</h3>
            <div className="mt-3"><Answer text={trace.naive_answer} /></div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {trace.naive_sources.map((s, i) => <span key={i} className="rounded border border-edge px-2 py-0.5 font-mono text-[10px] text-zinc-500">{s.source} · p{s.page}</span>)}
            </div>
          </div>
          <div className="rounded-xl border border-emerald-400/40 bg-panel p-5">
            <h3 className="font-mono text-[11px] uppercase tracking-widest text-accent">advanced · hybrid + rerank</h3>
            <div className="mt-3"><Answer text={trace.advanced_answer} /></div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {trace.reranked.map((c, i) => <span key={i} className="rounded border border-emerald-400/30 px-2 py-0.5 font-mono text-[10px] text-emerald-300">{c.source} · p{c.page}</span>)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
