/** Landing — product chrome for the advanced-RAG lab. */
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import RetrievalFlow from '../components/RetrievalFlow'
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

const SURFACES = [
  { to: '/inspector', kicker: 'Inspector', title: 'Watch a query flow', body: 'HyDE probe, hybrid candidates with vector vs keyword rank, then rerank promotions — live.' },
  { to: '/compare', kicker: 'Compare', title: 'Naive vs advanced', body: 'Same question, two answers. Vector-only on the left; hybrid + rerank on the right.' },
  { to: '/eval', kicker: 'Eval', title: 'Measure the delta', body: 'Hand-labelled recall@k and MRR on the demo corpus. Advanced 100% vs naive 86%.' },
  { to: '/docs', kicker: 'Docs', title: 'See the corpus', body: 'Chunks stored with situating context and dual embeddings. Upload a PDF to try ingest.' },
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
      <div className="atmosphere-grid pointer-events-none fixed inset-0 -z-10" />
      <LandingNav />

      <div className="relative mx-auto max-w-6xl px-5 pt-16 pb-20 sm:px-6 sm:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_auto] lg:gap-16">
          <div>
            <motion.div {...rise(0)} className="flex flex-wrap items-center gap-2">
              <span className="chip">ADVANCED RAG · INSTRUMENTED</span>
              <span className="chip inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                demo corpus live
              </span>
            </motion.div>
            <motion.h1 {...rise(1)} className="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight text-zinc-50 sm:text-6xl">
              Retrieval you can
              <span className="mt-1 block bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">watch, and measure.</span>
            </motion.h1>
            <motion.p {...rise(2)} className="mt-5 max-w-xl text-lg text-zinc-400">
              The techniques 2026 job posts actually ask for — contextual chunking,
              hybrid search, cross-encoder reranking, query transformation — in one
              pipeline, with citations.
            </motion.p>
            <motion.div {...rise(3)} className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/inspector" className="btn-primary">Open the Inspector</Link>
              <Link to="/eval" className="btn-secondary">See the eval</Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              className="mt-10 rounded-xl border border-edge bg-black/25 p-3 md:hidden"
            >
              <RetrievalFlow />
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35, duration: 0.55 }}
            className="hidden rounded-xl border border-edge bg-black/25 p-4 md:block"
          >
            <RetrievalFlow />
          </motion.div>
        </div>

        <div className="mt-20 border-y border-edge/80">
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 py-8 sm:grid-cols-3 lg:grid-cols-5">
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col gap-1">
                <span className="font-mono text-2xl font-medium tracking-tight text-zinc-50 sm:text-3xl">{s.n}</span>
                <span className="text-xs leading-snug text-zinc-500">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <section className="mt-24">
          <p className="kicker text-cyan-400">The advanced-RAG ladder</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">Five upgrades that separate a demo from production.</h2>
          <p className="mt-3 max-w-2xl text-zinc-500">Naive RAG (chunk → embed → top-k cosine) is the right start and the wrong finish. Each rung is independently inspectable.</p>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {LADDER.map((step, i) => (
              <motion.div
                key={step.title}
                {...inView}
                className={`rounded-xl border border-edge bg-panel p-5 ${i === 4 ? 'sm:col-span-2 lg:col-span-1' : ''}`}
              >
                <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border font-mono text-xs ${step.tone}`}>{step.n}</span>
                <h3 className="mt-3 text-base font-medium tracking-tight text-zinc-100">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{step.body}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mt-24">
          <p className="kicker text-emerald-400">Workbench</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">Four surfaces. Same pipeline.</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {SURFACES.map((s) => (
              <Link
                key={s.to}
                to={s.to}
                className="group relative flex flex-col gap-2 rounded-xl border border-edge bg-panel p-6 transition hover:bg-white/[0.02]"
              >
                <span className="absolute right-5 top-5 text-zinc-600 opacity-0 transition group-hover:opacity-100">→</span>
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-500">{s.kicker}</span>
                <h3 className="text-lg font-medium tracking-tight text-zinc-100">{s.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-400">{s.body}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-24 border-y border-edge/80 py-8">
          <p className="text-center font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-600">Stack</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 font-mono text-xs text-zinc-500">
            {['FastAPI', 'pgvector', 'Mistral embeddings', 'Groq', 'FlashRank', 'React', 'Vite', 'Cloudflare Pages'].map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <div className="relative overflow-hidden rounded-xl border border-edge px-8 py-14 text-center">
            <div aria-hidden className="pointer-events-none absolute -bottom-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/20 blur-3xl" />
            <div className="relative flex flex-col items-center gap-5">
              <LogoMark className="h-12 w-12" />
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">Ask the handbook. Watch the ranks move.</h2>
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
