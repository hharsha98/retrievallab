/** Docs — what's in the corpus, and upload your own PDF (contextual ingest). */
import { useEffect, useState } from 'react'
import { api, type Doc } from '../lib/api'

export default function Docs() {
  const [docs, setDocs] = useState<Doc[]>([])
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState('')

  const load = () => api<Doc[]>('/api/documents').then(setDocs).catch(() => {})
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
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-zinc-500">corpus</p>
      <h2 className="mt-1 text-2xl font-semibold text-zinc-100">What the pipeline searches over.</h2>
      <p className="mt-2 max-w-2xl text-sm text-zinc-500">
        Each chunk is stored with an LLM-generated <span className="text-cyan-400">situating context</span>
        {' '}(contextual retrieval) and two embeddings — one content-only (naive baseline), one context-enriched (advanced).
      </p>

      <ul className="mt-6 space-y-2">
        {docs.map((d, i) => (
          <li key={i} className="flex items-center justify-between rounded-md border border-edge bg-panel px-4 py-3">
            <span className="text-sm text-zinc-200">{d.filename}</span>
            <span className="font-mono text-[11px] text-zinc-500">{d.chunks} chunks</span>
          </li>
        ))}
        {docs.length === 0 && <li className="text-sm text-zinc-600">No documents yet.</li>}
      </ul>

      <label className={`mt-5 block cursor-pointer rounded-md border border-dashed border-edge px-4 py-6 text-center text-sm transition hover:border-accent/50 ${uploading ? 'opacity-50' : ''}`}>
        <span className="text-zinc-400">{uploading ? 'Contextual chunking + embedding…' : 'Upload a PDF (≤5 MB, ≤20 pages)'}</span>
        <input type="file" accept="application/pdf" className="hidden" disabled={uploading}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = '' }} />
      </label>
      {msg && <p className="mt-3 text-sm text-zinc-400">{msg}</p>}
      <p className="mt-2 text-[11px] text-zinc-600">Uploading calls one LLM per chunk to write its context, so a few pages take a little while.</p>
    </div>
  )
}
