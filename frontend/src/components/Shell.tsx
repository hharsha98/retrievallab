/** App chrome: top bar on mobile, left rail on desktop. */
import { NavLink, Outlet } from 'react-router-dom'
import { Brand } from './Logo'
import { StatusDot } from './Ui'
import { useApiStatus } from '../lib/health'

const tabs = [
  { to: '/inspector', label: 'Inspector', caption: 'Watch the pipeline' },
  { to: '/compare', label: 'Compare', caption: 'Naive vs advanced' },
  { to: '/eval', label: 'Eval', caption: 'recall@k · MRR' },
  { to: '/docs', label: 'Docs', caption: 'Corpus + ingest' },
]

export default function Shell() {
  const status = useApiStatus()
  return (
    <div className="min-h-dvh atmosphere flex flex-col md:flex-row">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-24 left-[18%] h-80 w-80 rounded-full bg-accent/10 blur-[100px]" />
        <div className="atmosphere-dots absolute inset-0 opacity-20" />
      </div>
      <aside className="shrink-0 border-b border-edge/80 bg-ink/60 px-3 py-2 backdrop-blur-md
                        md:flex md:w-56 md:flex-col md:items-stretch md:border-b-0 md:border-r md:px-4 md:py-6">
        <div className="flex items-center gap-3 overflow-x-auto md:flex-col md:items-stretch md:overflow-visible">
          <NavLink to="/" className="mr-2 shrink-0 md:mb-8 md:mr-0">
            <Brand compact />
          </NavLink>
          <nav className="flex items-center gap-1 md:flex-col md:items-stretch">
            {tabs.map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                className={({ isActive }) =>
                  `flex shrink-0 flex-col rounded-lg px-3 py-1.5 text-sm transition-colors md:py-2.5 ${
                    isActive
                      ? 'bg-emerald-400/10 text-accent'
                      : 'text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-100'
                  }`}
              >
                <span>{t.label}</span>
                <span className="hidden font-mono text-[10px] text-zinc-600 md:block">{t.caption}</span>
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="mt-auto hidden space-y-3 md:block">
          <div className="rounded-lg border border-edge bg-panel px-3 py-2.5 text-[11px] leading-relaxed text-zinc-500">
            Demo corpus: a synthetic robot handbook. Advanced RAG, instrumented.
          </div>
          <StatusDot status={status} />
        </div>
      </aside>
      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto"><Outlet /></main>
    </div>
  )
}
