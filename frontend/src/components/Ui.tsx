import type { FormEvent, ReactNode } from 'react'

export function PageHeader({
  kicker,
  title,
  lede,
}: {
  kicker: string
  title: string
  lede?: ReactNode
}) {
  return (
    <header className="max-w-2xl">
      <p className="kicker text-zinc-500">{kicker}</p>
      <h1 className="mt-2 text-[1.65rem] font-semibold tracking-tight text-zinc-50 sm:text-3xl">{title}</h1>
      {lede && <div className="mt-2 text-sm leading-relaxed text-zinc-500">{lede}</div>}
    </header>
  )
}

export function QueryBar({
  value,
  onChange,
  onSubmit,
  busy,
  placeholder,
  action,
  busyLabel = 'Running…',
}: {
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  busy: boolean
  placeholder?: string
  action: string
  busyLabel?: string
}) {
  function handle(e: FormEvent) {
    e.preventDefault()
    onSubmit()
  }
  return (
    <form onSubmit={handle} className="mt-6 flex flex-col gap-2 sm:flex-row">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={busy}
        className="field flex-1"
      />
      <button type="submit" disabled={busy || !value.trim()} className="btn-solid">
        {busy ? busyLabel : action}
      </button>
    </form>
  )
}

export function EmptyState({
  title,
  body,
  children,
}: {
  title: string
  body: string
  children?: ReactNode
}) {
  return (
    <div className="panel mt-8 px-6 py-10 text-center">
      <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-lg border border-edge bg-raised">
        <span className="h-2 w-2 rounded-full bg-accent/80 shadow-[0_0_12px_rgb(52_211_153_/_0.8)]" />
      </div>
      <h2 className="text-sm font-medium tracking-tight text-zinc-100">{title}</h2>
      <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-zinc-500">{body}</p>
      {children && <div className="mt-5">{children}</div>}
    </div>
  )
}

export function StatusDot({ status }: { status: string }) {
  const ok = status === 'ok'
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-zinc-500">
      <i className={`inline-block h-1.5 w-1.5 rounded-full ${ok ? 'bg-accent shadow-[0_0_8px_rgb(52_211_153)]' : status === 'checking' ? 'bg-amber-400/80' : 'bg-red-400'}`} />
      api {status}
    </span>
  )
}

export function Answer({ text }: { text: string }) {
  return (
    <p className="text-sm leading-relaxed text-zinc-200">
      {text.split(/(\[\d+\])/g).map((p, i) =>
        /^\[\d+\]$/.test(p)
          ? <span key={i} className="mx-0.5 rounded bg-emerald-400/15 px-1.5 font-mono text-[11px] text-accent">{p}</span>
          : <span key={i}>{p}</span>)}
    </p>
  )
}

export function ErrorNote({ message }: { message: string }) {
  if (!message) return null
  return (
    <p className="mt-4 rounded-lg border border-rose-400/25 bg-rose-400/8 px-3 py-2 text-sm text-rose-300">{message}</p>
  )
}
