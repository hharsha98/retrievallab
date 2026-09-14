import { useId } from 'react'

/** RetrievalLab mark: a retrieval lens around stacked document chunks.
 *  The middle chunk is the retrieved hit. Not a letterform, not a triangular arrow. */
type MarkProps = {
  className?: string
  title?: string
}

export function LogoMark({ className = 'h-7 w-7', title = 'RetrievalLab' }: MarkProps) {
  const uid = useId().replace(/:/g, '')
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <defs>
        <linearGradient id={`${uid}-ring`} x1="6" y1="4" x2="42" y2="44">
          <stop stopColor="#34d399" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
        <linearGradient id={`${uid}-hit`} x1="16" y1="18" x2="34" y2="30">
          <stop stopColor="#34d399" />
          <stop offset="1" stopColor="#6ee7b7" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="18.75" stroke={`url(#${uid}-ring)`} strokeWidth="2.25" />
      <rect x="13" y="14.5" width="16" height="6.2" rx="1.6" fill="#07070a" stroke="#34d399" strokeWidth="1.35" />
      <rect x="19" y="27.2" width="15" height="5.8" rx="1.5" fill="#07070a" stroke="#22d3ee" strokeWidth="1.35" />
      <rect x="16" y="19.6" width="18.5" height="7.4" rx="1.8" fill={`url(#${uid}-hit)`} />
      <rect x="19.2" y="22.1" width="8" height="1.35" rx="0.65" fill="#052e1c" opacity="0.45" />
      <rect x="19.2" y="24.4" width="5" height="1.35" rx="0.65" fill="#052e1c" opacity="0.28" />
    </svg>
  )
}

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`tracking-tight ${className}`}>
      <span className="text-zinc-50">Retrieval</span>
      <span className="text-accent">Lab</span>
    </span>
  )
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark className={compact ? 'h-7 w-7' : 'h-8 w-8'} />
      <span className={`font-semibold ${compact ? 'text-[15px]' : 'text-base'}`}>
        <Wordmark />
      </span>
    </span>
  )
}
