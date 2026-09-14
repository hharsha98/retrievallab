/** Docs — what's in the corpus, and upload your own PDF (contextual ingest). */
import { useEffect, useState } from 'react'
import { api, type Doc } from '../lib/api'
import { EmptyState, PageHeader } from '../components/Ui'

export default function Docs() {
  const [docs, setDocs] = useState<Doc[]>([])
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState('')
  const [failed, setFailed] = useState(false)
  const [ready, setReady] = useState(false)

  const load = () =>
    api<Doc[]>('/api/documents')
      .then((d) => { setDocs(d); setFailed(false) })
      .catch(() => setFailed(true))
      .finally(() => setReady(true))
  useEffect(() => { load() }, [])

  async function upload(file: File) {
    setUploading(true); setMsg('')
    try {
      const form = new FormData()
      form.append('file', file)
      const r = await api<{ filename: string; chunks: number }>('/api/documents', { method: 'POST', body: form })
      setMsg(`Ingested ${r.filename} → ${r.chunks} chunks (contextual + embedded).`)
      await load()
    } catch (e) { setMsg(e instanceof Error ? e.message.slice(0, 200) : String(e)) } finally { setUploading(false) }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader
        kicker="corpus"
        title="What the pipeline searches over."
        lede={
          <>
            Each chunk is stored with an LLM-generated <span className="text-cyan-400">situating context</span>
            {' '}(contextual retrieval) and two embeddings — one content-only (naive baseline), one context-enriched (advanced).
          </>
        }
      />

      {ready && docs.length === 0 && !failed && (
        <EmptyState
          title="No documents yet"
          body="The demo handbook should appear here once the API is reachable. You can still upload a small PDF below."
        />
      )}
      {!ready && !failed && (
        <div className="panel mt-6 h-16 animate-pulse" />
      )}
      {failed && (
        <EmptyState
          title="Corpus unreachable"
          body="The documents endpoint did not respond. Check that the API is up, then refresh."
        />
      )}

      {docs.length > 0 && (
        <ul className="mt-6 space-y-2">
          {docs.map((d, i) => (
            <li key={i} className="flex items-center justify-between rounded-lg border border-edge bg-panel px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-edge bg-raised font-mono text-[10px] text-cyan-400">PDF</span>
                <span className="truncate text-sm text-zinc-200">{d.filename}</span>
              </div>
              <span className="shrink-0 font-mono text-[11px] text-zinc-500">{d.chunks} chunks</span>
            </li>
          ))}
        </ul>
      )}

      <label className={`mt-5 block cursor-pointer rounded-xl border border-dashed border-edge bg-panel/40 px-4 py-8 text-center text-sm transition hover:border-accent/50 ${uploading ? 'opacity-50' : ''}`}>
        <span className="block font-medium text-zinc-200">{uploading ? 'Contextual chunking + embedding…' : 'Upload a PDF'}</span>
        <span className="mt-1 block text-zinc-500">≤5 MB, ≤20 pages. One LLM call per chunk to write its context.</span>
        <input type="file" accept="application/pdf" className="hidden" disabled={uploading}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = '' }} />
      </label>
      {msg && <p className="mt-3 text-sm text-zinc-400">{msg}</p>}
    </div>
  )
}
