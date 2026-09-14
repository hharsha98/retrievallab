/** Pipeline Inspector — the showpiece. Ask a question and watch it flow through
 *  every stage: query → transformation → hybrid retrieve → rerank → answer.
 *  The rerank stage visibly shows each chunk's hybrid rank moving to its new one. */
import { useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { api, type Candidate, type QueryTrace } from '../lib/api'
import { Answer, EmptyState, ErrorNote, PageHeader, QueryBar } from '../components/Ui'

const EXAMPLES = [
  'What certification does the Atlas-7 hold?',
  'What is the part number for the replacement servo?',
  'How long is the warranty and what does it cover?',
]

const PIPELINE = ['HyDE', 'hybrid', 'rerank', 'answer']

function Stage({ n, kicker, children }: { n: number; kicker: string; children: ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 * n, duration: 0.4 }}
      className="panel p-5"
    >
      <h3 className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500">
        <span className="inline-flex h-5 w-5 items-center justify-center rounded border border-emerald-400/25 bg-emerald-400/10 text-[10px] text-accent">
          {String(n + 1).padStart(2, '0')}
        </span>
        {kicker}
      </h3>
      {children}
    </motion.section>
  )
}

function CandidateRow({ c, showRerank }: { c: Candidate; showRerank?: boolean }) {
  const moved = showRerank && c.hybrid_rank != null && c.new_rank != null ? c.hybrid_rank - c.new_rank : 0
  return (
    <div className="rounded-lg border border-edge bg-ink/60 px-3 py-2.5">
      <div className="mb-1.5 flex flex-wrap items-center gap-2 font-mono text-[10px]">
        {showRerank && c.hybrid_rank != null && (
          <span className={`rounded px-1.5 py-0.5 ${moved > 0 ? 'bg-emerald-400/15 text-emerald-300' : moved < 0 ? 'bg-rose-400/15 text-rose-300' : 'bg-zinc-700/40 text-zinc-400'}`}>
            hybrid #{c.hybrid_rank + 1} → #{(c.new_rank ?? 0) + 1} {moved > 0 ? `↑${moved}` : moved < 0 ? `↓${-moved}` : ''}
          </span>
        )}
        {c.rerank_score != null && <span className="text-accent">score {c.rerank_score.toFixed(3)}</span>}
        {!showRerank && c.vector_rank != null && <span className="rounded bg-cyan-400/15 px-1.5 py-0.5 text-cyan-300">vector #{c.vector_rank + 1}</span>}
        {!showRerank && c.keyword_rank != null && <span className="rounded bg-amber-400/15 px-1.5 py-0.5 text-amber-300">keyword #{c.keyword_rank + 1}</span>}
        <span className="text-zinc-600">{c.source} · p{c.page}</span>
      </div>
      <p className="line-clamp-2 text-[13px] text-zinc-400">{c.content}</p>
    </div>
  )
}

export default function Inspector() {
  const [q, setQ] = useState('')
  const [trace, setTrace] = useState<QueryTrace | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function run(question: string) {
    if (!question.trim() || busy) return
    setBusy(true); setError(''); setTrace(null)
    try {
      setTrace(await api<QueryTrace>('/api/query', { method: 'POST', body: JSON.stringify({ question }) }))
    } catch (e) {
      setError(e instanceof Error ? e.message.slice(0, 200) : String(e))
    } finally { setBusy(false) }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader
        kicker="pipeline inspector"
        title="Watch a query flow through the pipeline."
        lede="HyDE, hybrid retrieval, cross-encoder rerank, then a grounded answer with citations — each stage stays on screen."
      />

      <QueryBar
        value={q}
        onChange={setQ}
        onSubmit={() => run(q)}
        busy={busy}
        placeholder="Ask the robot handbook…"
        action="Run"
      />

      {!trace && !busy && (
        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => { setQ(ex); run(ex) }}
              className="rounded-full border border-edge bg-panel px-3 py-1 text-xs text-zinc-400 transition hover:border-accent/50 hover:text-zinc-200"
            >
              {ex}
            </button>
          ))}
        </div>
      )}
      <ErrorNote message={error} />

      {busy && (
        <div className="panel mt-8 px-5 py-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">running pipeline</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {PIPELINE.map((step) => (
              <span
                key={step}
                className="inline-flex items-center gap-2 rounded-full border border-edge bg-raised px-3 py-1 font-mono text-[11px] text-zinc-400"
              >
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                {step}
              </span>
            ))}
          </div>
          <p className="mt-4 text-sm text-zinc-500">HyDE → hybrid retrieve → rerank → answer. First run may wake the reranker.</p>
        </div>
      )}

      {!trace && !busy && !error && (
        <EmptyState
          title="Nothing running yet"
          body="Pick an example, or type a question about certifications, part numbers, or warranty coverage in the demo handbook."
        />
      )}

      <AnimatePresence>
        {trace && (
          <div className="mt-6 space-y-4">
            <Stage n={0} kicker="query">
              <p className="text-sm text-zinc-200">{trace.original_query}</p>
            </Stage>

            <Stage n={1} kicker="query transformation">
              <p className="text-[11px] font-mono uppercase tracking-widest text-cyan-400">HyDE probe (embedded for search)</p>
              <p className="mt-1 rounded-lg border border-edge bg-ink/60 px-3 py-2 text-[13px] italic text-zinc-400">{trace.hyde}</p>
              {trace.sub_queries.length > 1 && (
                <>
                  <p className="mt-3 text-[11px] font-mono uppercase tracking-widest text-zinc-500">decomposed into</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {trace.sub_queries.map((s, i) => <span key={i} className="rounded border border-edge px-2 py-0.5 text-xs text-zinc-300">{s}</span>)}
                  </div>
                </>
              )}
            </Stage>

            <Stage n={2} kicker={`hybrid retrieve — ${trace.hybrid_candidates.length} candidates (vector + keyword, fused)`}>
              <div className="space-y-2">
                {trace.hybrid_candidates.slice(0, 6).map((c, i) => <CandidateRow key={i} c={c} />)}
                {trace.hybrid_candidates.length > 6 && <p className="text-center font-mono text-[11px] text-zinc-600">+{trace.hybrid_candidates.length - 6} more</p>}
              </div>
            </Stage>

            <Stage n={3} kicker="cross-encoder rerank → top 5 (watch the ranks move)">
              <div className="space-y-2">
                {trace.reranked.map((c, i) => <CandidateRow key={i} c={c} showRerank />)}
              </div>
            </Stage>

            <Stage n={4} kicker="grounded answer">
              <Answer text={trace.advanced_answer} />
              <p className="mt-3 font-mono text-[11px] text-zinc-600">
                pipeline took {trace.elapsed_ms} ms · <Link className="text-accent hover:underline" to="/compare">compare vs naive →</Link>
              </p>
            </Stage>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
