/** API client. Prod URL hardcoded (HF username hv1998) so a wrong build-time env
 *  var can't point the app at a dead Space — lesson from the CareerAgent bug. */
export const API_BASE = import.meta.env.DEV
  ? 'http://localhost:7860'
  : 'https://hv1998-retrievallab-api.hf.space'

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(init?.body && !(init.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
      ...(init?.headers as Record<string, string>),
    },
  })
  if (!res.ok) throw new Error((await res.text().catch(() => '')) || `HTTP ${res.status}`)
  return res.status === 204 ? (undefined as T) : res.json()
}

/* ---- backend types (mirror app/pipeline.py + evals.py) ---- */
export type Candidate = {
  content: string; context: string; source: string; page: number
  hybrid_rank: number | null; vector_rank: number | null; keyword_rank: number | null
  new_rank: number | null; rerank_score: number | null
}
export type QueryTrace = {
  original_query: string
  hyde: string
  sub_queries: string[]
  hybrid_candidates: Candidate[]
  reranked: Candidate[]
  naive_sources: { source: string; page: number }[]
  naive_answer: string
  advanced_answer: string
  elapsed_ms: number
}
export type Metrics = { recall_at_k: number; mrr: number; k: number }
export type EvalCase = {
  question: string; expected: string
  naive_rank: number | null; advanced_rank: number | null; improved: boolean
}
export type EvalResult = { k: number; naive: Metrics; advanced: Metrics; cases: EvalCase[] }
export type Doc = { filename: string; chunks: number }
