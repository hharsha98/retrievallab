/** Landing — teaches the advanced-RAG ladder and points to the Inspector. */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import RetrievalFlow from '../components/RetrievalFlow'
import { api } from '../lib/api'

const rise = (i: number) => ({
  initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 },
  transition: { delay: 0.1 * i, duration: 0.5 },
})
const inView = {
  initial: { opacity: 0, y: 14 }, whileInView: { opacity: 1, y: 0 },
  viewport: { once: true }, transition: { duration: 0.45 },
}

const LADDER = [
  ['Contextual chunking', 'An LLM writes a one-sentence context per chunk before embedding, so a chunk about "the second phase" still retrieves for "the Berlin rollout".', 'cyan'],
  ['Hybrid search', 'Vector (meaning) + BM25 (exact terms) fused with Reciprocal Rank Fusion — catches both paraphrases and part numbers.', 'emerald'],
  ['Cross-encoder rerank', 'A model reads (query, passage) together and re-sorts by true relevance. The single highest-leverage upgrade at scale.', 'indigo'],
  ['Query transformation', 'HyDE (embed a hypothetical answer) + decomposition, added as extra signals so they can only help recall.', 'amber'],
  ['Retrieval evaluation', 'recall@k and MRR, naive vs advanced. If you are not measuring, you are guessing.', 'rose'],
]
const C: Record<string, string> = {
  cyan: 'text-cyan-400 border-l-cyan-400/50', emerald: 'text-emerald-400 border-l-emerald-400/50',
  indigo: 'text-indigo-400 border-l-indigo-400/50', amber: 'text-amber-400 border-l-amber-400/50',
  rose: 'text-rose-400 border-l-rose-400/50',
}

export default function Landing() {
  const [status, setStatus] = useState('checking')
  useEffect(() => {
    api<{ status: string }>('/api/health').then((h) => setStatus(h.status)).catch(() => setStatus('offline'))
  }, [])

  return (
    <div className="min-h-dvh atmosphere">
      <div className="mx-auto max-w-5xl px-5 pt-16 pb-20 sm:px-6 sm:pt-24">
        <div className="grid items-center gap-10 md:grid-cols-[1fr_auto]">
          <div>
            <motion.p {...rise(0)} className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
              advanced RAG, made visible
            </motion.p>
            <motion.h1 {...rise(1)} className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              <span className="text-zinc-50">Retrieval</span><span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Lab</span>
            </motion.h1>
            <motion.p {...rise(2)} className="mt-5 max-w-xl text-lg text-zinc-400">
              The retrieval techniques 2026 job posts actually ask for — contextual chunking,
              hybrid search, cross-encoder reranking, query transformation — assembled into one
              pipeline you can watch work, and measure.
            </motion.p>
            <motion.div {...rise(3)} className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/inspector" className="glow-hover rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-zinc-950 transition hover:brightness-110">
                Open the Inspector →
              </Link>
              <Link to="/eval" className="rounded-md border border-edge px-5 py-2.5 text-sm text-zinc-300 transition hover:border-zinc-500">
                See the eval
              </Link>
              <a href="https://github.com/hharsha98/retrievallab" target="_blank" rel="noreferrer" className="px-2 font-mono text-sm text-zinc-500 hover:text-zinc-200">Code</a>
              <span className="ml-1 font-mono text-xs text-zinc-500">
                <i className={`mr-1.5 inline-block h-2 w-2 rounded-full ${status === 'ok' ? 'bg-accent' : 'bg-red-400'}`} />api {status}
              </span>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, duration: 0.6 }} className="hidden md:block">
            <RetrievalFlow />
          </motion.div>
        </div>

        <div className="mt-24">
          <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-500">the advanced-RAG ladder</h2>
          <div className="mt-6 space-y-3">
            {LADDER.map(([title, body, color], i) => (
              <motion.div key={title} {...inView} className={`rounded-xl border border-edge border-l-2 ${C[color].split(' ')[1]} bg-panel p-5`}>
                <h3 className="flex items-baseline gap-3 text-base font-semibold text-zinc-100">
                  <span className={`font-mono text-xs ${C[color].split(' ')[0]}`}>0{i + 1}</span>{title}
                </h3>
                <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-zinc-400">{body}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <footer className="mt-20 border-t border-edge/60 pt-6 font-mono text-xs text-zinc-600">
          built by Harsha · FastAPI · pgvector · FlashRank · React · €0/mo · <Link to="/inspector" className="text-accent">open the inspector →</Link>
        </footer>
      </div>
    </div>
  )
}
