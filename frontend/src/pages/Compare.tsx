/** Compare — the naive answer vs the advanced answer, side by side, same question. */
import { useState } from 'react'
import { api, type QueryTrace } from '../lib/api'
import { Answer, EmptyState, ErrorNote, PageHeader, QueryBar } from '../components/Ui'

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
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader
        kicker="compare"
        title="Naive vs advanced, same question."
        lede={
          <>
            Naive = pure vector search over content-only embeddings. Advanced = contextual
            embeddings + hybrid + HyDE + cross-encoder rerank.
          </>
        }
      />

      <QueryBar
        value={q}
        onChange={setQ}
        onSubmit={run}
        busy={busy}
        action="Compare"
        busyLabel="Comparing…"
      />
      <ErrorNote message={error} />

      {busy && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {['naive · vector only', 'advanced · hybrid + rerank'].map((label) => (
            <div key={label} className="panel h-40 animate-pulse p-5">
              <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-600">{label}</p>
              <div className="mt-4 space-y-2">
                <div className="h-2.5 w-full rounded bg-white/5" />
                <div className="h-2.5 w-4/5 rounded bg-white/5" />
                <div className="h-2.5 w-2/3 rounded bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!trace && !busy && !error && (
        <EmptyState
          title="Run a side-by-side"
          body="The default question is one where the advanced path usually cites the right certification. Change it, or hit Compare."
        />
      )}

      {trace && (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="panel p-5">
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
