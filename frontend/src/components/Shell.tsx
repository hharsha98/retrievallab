/** App chrome for the tool pages: top bar on mobile, left rail on desktop. */
import { NavLink, Outlet } from 'react-router-dom'

const tabs = [
  { to: '/inspector', label: 'Inspector', glyph: '⌕' },
  { to: '/compare', label: 'Compare', glyph: '⇋' },
  { to: '/eval', label: 'Eval', glyph: '∑' },
  { to: '/docs', label: 'Docs', glyph: '▤' },
]

export default function Shell() {
  return (
    <div className="min-h-dvh atmosphere flex flex-col md:flex-row">
      <aside className="shrink-0 border-b border-edge/70 px-3 py-2 flex items-center gap-1 overflow-x-auto
                        md:w-52 md:flex-col md:items-stretch md:border-b-0 md:border-r md:px-4 md:py-6">
        <NavLink to="/" className="mr-2 shrink-0 font-semibold tracking-tight text-zinc-50 md:mb-8 md:mr-0">
          Retrieval<span className="text-accent">Lab</span>
        </NavLink>
        {tabs.map((t) => (
          <NavLink key={t.to} to={t.to}
            className={({ isActive }) =>
              `flex shrink-0 items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors md:py-2 ${
                isActive ? 'bg-emerald-400/10 text-accent' : 'text-zinc-400 hover:text-zinc-100 hover:bg-panel'}`}>
            <span className="hidden font-mono text-xs md:inline md:w-4">{t.glyph}</span>{t.label}
          </NavLink>
        ))}
        <div className="mt-auto hidden rounded-md border border-edge bg-panel px-3 py-2.5 text-[11px] leading-relaxed text-zinc-500 md:block">
          Demo corpus: a synthetic robot handbook. Advanced RAG, instrumented.
        </div>
      </aside>
      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto"><Outlet /></main>
    </div>
  )
}
