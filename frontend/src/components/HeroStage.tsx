/** Product-window hero: the retrieval pipeline as an instrument, not a diagram on a blank field. */
import RetrievalFlow from './RetrievalFlow'

export default function HeroStage() {
  return (
    <div className="relative mx-auto w-full max-w-[36rem]">
      <div aria-hidden className="pointer-events-none absolute -inset-10 rounded-full bg-accent/20 blur-[90px]" />
      <div className="relative overflow-hidden rounded-2xl border border-edge bg-black/45 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_28px_80px_-28px_rgba(52,211,153,0.4)]">
        <div className="flex items-center gap-2 border-b border-edge px-4 py-2.5">
          <span className="h-2 w-2 rounded-full bg-rose-400/70" />
          <span className="h-2 w-2 rounded-full bg-amber-400/70" />
          <span className="h-2 w-2 rounded-full bg-accent/70" />
          <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">pipeline inspector</span>
          <span className="ml-auto hidden items-center gap-1.5 font-mono text-[10px] text-zinc-500 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" /> live trace
          </span>
        </div>
        <div className="px-3 pt-5 pb-2 sm:px-5">
          <RetrievalFlow className="w-full" />
        </div>
        <div className="space-y-2 border-t border-edge p-4">
          <div className="flex items-center justify-between gap-3 rounded-lg border border-emerald-400/25 bg-emerald-400/[0.06] px-3 py-2">
            <span className="font-mono text-[11px] text-emerald-300">hybrid #11 → #1 ↑10</span>
            <span className="truncate font-mono text-[11px] text-zinc-400">ISO 13482 · atlas-7 p.4</span>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-lg border border-edge bg-white/[0.03] px-3 py-2">
            <span className="font-mono text-[11px] text-zinc-400">keyword #4 · vector #9</span>
            <span className="font-mono text-[11px] text-zinc-600">rerank score 0.91</span>
          </div>
        </div>
      </div>
    </div>
  )
}
