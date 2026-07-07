/** Eval — recall@k and MRR, naive vs advanced, on a hand-labelled set. The
 *  eval-literacy showpiece: measuring whether the techniques actually help. */
import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { api, type EvalResult } from '../lib/api'

export default function Eval() {
  const [result, setResult] = useState<EvalResult | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function run() {
    setBusy(true); setError('')
    try {
      setResult(await api<EvalResult>('/api/eval', { method: 'POST' }))
    } catch (e) { setError(e instanceof Error ? e.message.slice(0, 200) : String(e)) } finally { setBusy(false) }
  }

  const chart = result ? [
    { metric: `recall@${result.k}`, naive: result.naive.recall_at_k, advanced: result.advanced.recall_at_k },
    { metric: 'MRR', naive: result.naive.mrr, advanced: result.advanced.mrr },
  ] : []

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-500">retrieval eval</p>
      <h2 className="mt-1 text-2xl font-semibold text-zinc-100">Does advanced actually beat naive?</h2>
      <p className="mt-2 max-w-2xl text-sm text-zinc-500">
        recall@k = was the answer chunk retrieved at all. MRR = how high. Run it against a
        hand-labelled set on the demo corpus. (First run wakes the reranker — give it a few seconds.)
      </p>

      <button onClick={run} disabled={busy} className="mt-5 rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-zinc-950 transition enabled:hover:brightness-110 disabled:opacity-40">
        {busy ? 'Evaluating…' : 'Run the eval'}
      </button>
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      {result && (
        <>
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-edge bg-panel p-4">
              <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-500">naive · vector only</p>
              <p className="mt-1.5 font-mono text-2xl text-zinc-100">recall {(result.naive.recall_at_k * 100).toFixed(0)}%</p>
              <p className="font-mono text-xs text-zinc-500">MRR {result.naive.mrr.toFixed(3)}</p>
            </div>
            <div className="rounded-lg border border-emerald-400/40 bg-panel p-4">
              <p className="font-mono text-[11px] uppercase tracking-widest text-accent">advanced · hybrid + rerank</p>
              <p className="mt-1.5 font-mono text-2xl text-accent">recall {(result.advanced.recall_at_k * 100).toFixed(0)}%</p>
              <p className="font-mono text-xs text-zinc-500">MRR {result.advanced.mrr.toFixed(3)}</p>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-edge bg-panel p-5">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chart}>
                <CartesianGrid stroke="#26262b" vertical={false} />
                <XAxis dataKey="metric" stroke="#52525b" fontSize={12} tickLine={false} />
                <YAxis stroke="#52525b" fontSize={11} domain={[0, 1]} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#18181b' }} contentStyle={{ background: '#101012', border: '1px solid #26262b', borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="naive" name="naive" fill="#52525b" radius={[3, 3, 0, 0]} />
                <Bar dataKey="advanced" name="advanced" fill="#34d399" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 rounded-lg border border-edge bg-panel p-5">
            <h3 className="mb-3 font-mono text-[11px] uppercase tracking-widest text-zinc-500">per question — rank of the answer chunk</h3>
            <ul className="divide-y divide-edge/60">
              {result.cases.map((c, i) => (
                <li key={i} className="flex items-start justify-between gap-3 py-2.5">
                  <p className="text-sm text-zinc-300">{c.question}</p>
                  <div className="shrink-0 text-right font-mono text-[11px]">
                    <span className="text-zinc-500">naive {c.naive_rank ? `#${c.naive_rank}` : 'miss'}</span>
                    <span className={`ml-2 ${c.improved ? 'text-accent' : 'text-zinc-400'}`}>adv {c.advanced_rank ? `#${c.advanced_rank}` : 'miss'}{c.improved ? ' ↑' : ''}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-zinc-600">
            Honest note: on a small clean corpus, strong embeddings make naive competitive — advanced's
            margin grows with corpus size and messiness. Measuring that instead of assuming it is the point.
          </p>
        </>
      )}
    </div>
  )
}
