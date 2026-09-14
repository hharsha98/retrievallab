import { useId } from 'react'

/** RetrievalLab mark: a retrieval lens focusing a chunk-graph.
 *  Not a letterform, not a triangular arrow — three document chunks
 *  linked as a neighborhood, the middle one lit as the retrieved hit. */
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
        <linearGradient id={`${uid}-ring`} x1="8" y1="6" x2="42" y2="40">
          <stop stopColor="#34d399" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
        <linearGradient id={`${uid}-hit`} x1="18" y1="20" x2="34" y2="30">
          <stop stopColor="#34d399" />
          <stop offset="1" stopColor="#6ee7b7" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="18.5" stroke={`url(#${uid}-ring)`} strokeWidth="1.75" />
      <circle cx="24" cy="24" r="13.4" stroke="#22d3ee" strokeOpacity="0.32" strokeWidth="1" />
      <path d="M16 20.5 24 24l8 3.4" stroke="#34d399" strokeOpacity="0.42" strokeWidth="1.2" />
      <path d="M18 28.6 24 24l6.2-4.6" stroke="#22d3ee" strokeOpacity="0.32" strokeWidth="1.1" />
      <rect x="12.2" y="16.2" width="8.2" height="5.1" rx="1.3" fill="#07070a" stroke="#34d399" strokeOpacity="0.75" />
      <rect x="27.6" y="26.2" width="8.2" height="5.1" rx="1.3" fill="#07070a" stroke="#22d3ee" strokeOpacity="0.75" />
      <rect x="18.2" y="20.8" width="11.6" height="6.8" rx="1.6" fill={`url(#${uid}-hit)`} />
      <rect x="20.4" y="23" width="5.4" height="1.15" rx="0.57" fill="#052e1c" opacity="0.5" />
      <rect x="20.4" y="25.15" width="3.4" height="1.15" rx="0.57" fill="#052e1c" opacity="0.32" />
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
      <LogoMark className={compact ? 'h-6 w-6' : 'h-7 w-7'} />
      <span className={`font-semibold ${compact ? 'text-[15px]' : 'text-base'}`}>
        <Wordmark />
      </span>
    </span>
  )
}
