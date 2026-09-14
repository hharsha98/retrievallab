/** Landing — product chrome for the advanced-RAG lab. */
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import HeroStage from '../components/HeroStage'
import { LandingNav } from '../components/LandingNav'
import { LogoMark } from '../components/Logo'

const rise = (i: number) => ({
  initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 },
  transition: { delay: 0.08 * i, duration: 0.5 },
})
const inView = {
  initial: { opacity: 0, y: 14 }, whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' }, transition: { duration: 0.45 },
}

const LADDER = [
  { n: '01', title: 'Contextual chunking', body: 'An LLM writes a one-sentence context per chunk before embedding, so a chunk about "the second phase" still retrieves for "the Berlin rollout".', tone: 'text-cyan-400 border-cyan-400/25 bg-cyan-400/8' },
  { n: '02', title: 'Hybrid search', body: 'Vector (meaning) + BM25 (exact terms) fused with Reciprocal Rank Fusion — catches both paraphrases and part numbers.', tone: 'text-emerald-400 border-emerald-400/25 bg-emerald-400/8' },
  { n: '03', title: 'Cross-encoder rerank', body: 'A model reads (query, passage) together and re-sorts by true relevance. The single highest-leverage upgrade at scale.', tone: 'text-indigo-400 border-indigo-400/25 bg-indigo-400/8' },
  { n: '04', title: 'Query transformation', body: 'HyDE (embed a hypothetical answer) + decomposition, added as extra signals so they can only help recall.', tone: 'text-amber-400 border-amber-400/25 bg-amber-400/8' },
  { n: '05', title: 'Retrieval evaluation', body: 'recall@k and MRR, naive vs advanced. If you are not measuring, you are guessing.', tone: 'text-rose-400 border-rose-400/25 bg-rose-400/8' },
]

const STATS = [
  { n: '5', label: 'pipeline stages you can watch' },
  { n: '100%', label: 'advanced recall on the demo set' },
  { n: '86%', label: 'naive recall — fooled by a decoy' },
  { n: 'RRF', label: 'hybrid fusion of vector + BM25' },
  { n: '€0', label: 'free-tier stack, including Pages' },
]

export default function Landing() {
  return (
    <div className="min-h-dvh atmosphere">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 left-1/4 h-[32rem] w-[32rem] rounded-full bg-accent/10 blur-[120px]" />
        <div className="absolute top-1/3 right-0 h-[28rem] w-[28rem] rounded-full bg-cyan-400/10 blur-[120px]" />
        <div className="atmosphere-grid absolute inset-0" />
        <div className="atmosphere-dots absolute inset-0" />
      </div>
      <LandingNav />

      <section className="relative mx-auto flex min-h-[calc(100dvh-4rem)] max-w-6xl items-center px-5 py-16 sm:px-6 lg:py-20">
        <div className="grid w-full items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,36rem)] lg:gap-16">
          <div>
            <motion.div {...rise(0)} className="flex flex-wrap items-center gap-2">
              <span className="chip">ADVANCED RAG · INSTRUMENTED</span>
              <span className="chip inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                demo corpus live
              </span>
            </motion.div>
            <motion.h1 {...rise(1)} className="display mt-6 text-4xl leading-[1.12] text-zinc-50 sm:text-5xl lg:text-6xl">
              Retrieval you can
              <span className="mt-1 block bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">watch, and measure.</span>
            </motion.h1>
            <motion.p {...rise(2)} className="mt-5 max-w-md text-base leading-relaxed text-zinc-400 sm:text-lg">
              Contextual chunking, hybrid search, cross-encoder reranking, and query
              transformation — in one pipeline, with citations.
            </motion.p>
            <motion.div {...rise(3)} className="mt-8 flex flex-wrap items-center gap-5">
              <Link to="/inspector" className="btn-primary">Open the Inspector</Link>
              <Link to="/eval" className="btn-ghost-link">See the eval</Link>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.55 }}
            className="lg:justify-self-end"
          >
            <HeroStage />
          </motion.div>
        </div>
      </section>

      <div className="border-y border-edge/80">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-8 px-5 py-10 sm:grid-cols-3 sm:px-6 lg:grid-cols-5">
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col gap-1">
              <span className="font-mono text-2xl font-medium tracking-tight text-zinc-50 sm:text-3xl">{s.n}</span>
              <span className="text-xs leading-snug text-zinc-500">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative mx-auto max-w-6xl px-5 py-24 sm:px-6">
        <section>
          <p className="kicker text-cyan-400">The advanced-RAG ladder</p>
          <h2 className="display mt-3 text-3xl text-zinc-50 sm:text-4xl">Five upgrades that separate a demo from production.</h2>
          <p className="mt-3 max-w-2xl text-zinc-500">Naive RAG (chunk → embed → top-k cosine) is the right start and the wrong finish. Each rung is independently inspectable.</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {LADDER.map((step, i) => (
              <motion.div
                key={step.title}
                {...inView}
                className={`rounded-xl border border-edge bg-panel p-6 ${i === 4 ? 'sm:col-span-2 lg:col-span-1' : ''}`}
              >
                <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border font-mono text-xs ${step.tone}`}>{step.n}</span>
                <h3 className="mt-4 text-base font-medium tracking-tight text-zinc-100">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{step.body}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mt-28">
          <p className="kicker text-emerald-400">Workbench</p>
          <h2 className="display mt-3 text-3xl text-zinc-50 sm:text-4xl">Four surfaces. Same pipeline.</h2>
          <p className="mt-3 max-w-2xl text-zinc-500">Ask, compare, measure, inspect the corpus — without leaving the lab.</p>
          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            <Link to="/inspector" className="group relative flex flex-col justify-between gap-6 rounded-xl border border-edge bg-panel p-6 transition hover:bg-white/[0.02]">
              <span className="absolute right-5 top-5 text-zinc-600 opacity-0 transition group-hover:opacity-100">→</span>
              <div>
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-500">Inspector</span>
                <h3 className="mt-2 text-lg font-medium tracking-tight text-zinc-100">Watch a query flow</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">HyDE probe, hybrid candidates, then rerank promotions — live.</p>
              </div>
              <div className="space-y-2 rounded-lg border border-edge bg-black/30 p-3">
                <div className="flex gap-1.5 font-mono text-[10px] text-zinc-500">
                  <span className="rounded border border-edge px-1.5 py-0.5">HyDE</span>
                  <span className="rounded border border-emerald-400/30 bg-emerald-400/10 px-1.5 py-0.5 text-emerald-300">hybrid #11 → #1</span>
                </div>
                <p className="text-xs text-zinc-400">ISO 13482 for working next to people…</p>
              </div>
            </Link>
            <Link to="/compare" className="group relative flex flex-col justify-between gap-6 rounded-xl border border-edge bg-panel p-6 transition hover:bg-white/[0.02]">
              <span className="absolute right-5 top-5 text-zinc-600 opacity-0 transition group-hover:opacity-100">→</span>
              <div>
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-500">Compare</span>
                <h3 className="mt-2 text-lg font-medium tracking-tight text-zinc-100">Naive vs advanced</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">Same question, two answers. Vector-only on the left; hybrid + rerank on the right.</p>
              </div>
              <div className="grid grid-cols-2 gap-2 rounded-lg border border-edge bg-black/30 p-3">
                <div className="rounded-md border border-edge p-2">
                  <p className="font-mono text-[9px] uppercase text-zinc-600">naive</p>
                  <div className="mt-2 space-y-1"><div className="h-1.5 w-full rounded bg-white/10" /><div className="h-1.5 w-2/3 rounded bg-white/10" /></div>
                </div>
                <div className="rounded-md border border-emerald-400/30 bg-emerald-400/[0.06] p-2">
                  <p className="font-mono text-[9px] uppercase text-accent">advanced</p>
                  <div className="mt-2 space-y-1"><div className="h-1.5 w-full rounded bg-accent/40" /><div className="h-1.5 w-3/4 rounded bg-accent/25" /></div>
                </div>
              </div>
            </Link>
            <Link to="/eval" className="group relative flex flex-col justify-between gap-6 rounded-xl border border-edge bg-panel p-6 transition hover:bg-white/[0.02]">
              <span className="absolute right-5 top-5 text-zinc-600 opacity-0 transition group-hover:opacity-100">→</span>
              <div>
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-500">Eval</span>
                <h3 className="mt-2 text-lg font-medium tracking-tight text-zinc-100">Measure the delta</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">Hand-labelled recall@k and MRR on the demo corpus.</p>
              </div>
              <div className="flex items-end gap-3 rounded-lg border border-edge bg-black/30 px-3 py-3">
                <div className="flex flex-col items-center gap-1">
                  <div className="h-10 w-8 rounded-t bg-zinc-600/80" />
                  <span className="font-mono text-[9px] text-zinc-500">86%</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="h-14 w-8 rounded-t bg-accent" />
                  <span className="font-mono text-[9px] text-accent">100%</span>
                </div>
                <span className="mb-1 ml-auto font-mono text-[10px] text-zinc-500">recall@k</span>
              </div>
            </Link>
            <Link to="/docs" className="group relative flex flex-col justify-between gap-6 rounded-xl border border-edge bg-panel p-6 transition hover:bg-white/[0.02]">
              <span className="absolute right-5 top-5 text-zinc-600 opacity-0 transition group-hover:opacity-100">→</span>
              <div>
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-500">Docs</span>
                <h3 className="mt-2 text-lg font-medium tracking-tight text-zinc-100">See the corpus</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">Chunks with situating context and dual embeddings. Upload a PDF to try ingest.</p>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-edge bg-black/30 px-3 py-2.5">
                <span className="flex items-center gap-2 text-xs text-zinc-300">
                  <span className="rounded border border-edge px-1.5 py-0.5 font-mono text-[9px] text-cyan-400">PDF</span>
                  atlas-7-handbook.pdf
                </span>
                <span className="font-mono text-[10px] text-zinc-500">19 chunks</span>
              </div>
            </Link>
          </div>
        </section>

        <section className="mt-28 border-y border-edge/80 py-10">
          <p className="text-center font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-600">Stack</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 font-mono text-xs text-zinc-500">
            {['FastAPI', 'pgvector', 'Mistral embeddings', 'Groq', 'FlashRank', 'React', 'Vite', 'Cloudflare Pages'].map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <div className="relative overflow-hidden rounded-2xl border border-edge px-8 py-16 text-center">
            <div aria-hidden className="pointer-events-none absolute -bottom-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/20 blur-3xl" />
            <div className="relative flex flex-col items-center gap-5">
              <LogoMark className="h-14 w-14" />
              <h2 className="display text-3xl text-zinc-50 sm:text-4xl">Ask the handbook. Watch the ranks move.</h2>
              <p className="max-w-md text-sm text-zinc-500">No account. Demo corpus is seeded. Open the Inspector and run an example question.</p>
              <Link to="/inspector" className="btn-primary">Open the Inspector →</Link>
            </div>
          </div>
        </section>

        <footer className="mt-16 flex flex-wrap items-center justify-between gap-3 font-mono text-xs text-zinc-600">
          <span>built by Harsha · €0/mo</span>
          <a href="https://github.com/hharsha98/retrievallab" className="hover:text-zinc-300">source</a>
        </footer>
      </div>
    </div>
  )
}
