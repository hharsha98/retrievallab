import { useId } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Brand } from './Logo'
import { StatusDot } from './Ui'
import { useApiStatus } from '../lib/health'

const links = [
  { to: '/inspector', label: 'Inspector' },
  { to: '/compare', label: 'Compare' },
  { to: '/eval', label: 'Eval' },
  { to: '/docs', label: 'Docs' },
]

function NavItems({ className }: { className?: string }) {
  return (
    <nav className={className}>
      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          className="shrink-0 rounded-md px-3 py-1.5 text-sm text-zinc-400 transition hover:bg-white/[0.03] hover:text-zinc-100"
        >
          {l.label}
        </NavLink>
      ))}
      <a
        href="https://github.com/hharsha98/retrievallab"
        target="_blank"
        rel="noreferrer"
        className="shrink-0 rounded-md px-3 py-1.5 text-sm text-zinc-400 transition hover:bg-white/[0.03] hover:text-zinc-100"
      >
        GitHub
      </a>
    </nav>
  )
}

export function LandingNav() {
  const status = useApiStatus()
  const uid = useId()
  return (
    <header className="sticky top-0 z-20 border-b border-edge/80 bg-ink/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-5 sm:px-6">
        <Link to="/" className="shrink-0" aria-labelledby={uid}>
          <span id={uid} className="sr-only">RetrievalLab home</span>
          <Brand compact />
        </Link>
        <NavItems className="hidden items-center gap-0.5 md:flex" />
        <div className="ml-auto flex items-center gap-3">
          <StatusDot status={status} />
          <Link to="/inspector" className="btn-primary !px-4 !py-2 text-[13px]">
            Open Inspector
          </Link>
        </div>
      </div>
      <NavItems className="flex gap-1 overflow-x-auto border-t border-edge/70 px-3 py-1 md:hidden" />
    </header>
  )
}
