"""Ingest with CONTEXTUAL RETRIEVAL (Anthropic's technique, cuts retrieval
failures ~67%): before embedding each chunk, an LLM writes a 1-sentence context
that situates the chunk inside its document. We embed context+content together,
so a chunk about "the second phase" still retrieves for "the Berlin rollout".
"""
import io
import re
import time

from pypdf import PdfReader

from app.config import settings
from app.db import get_conn
from app.llm import embed, fast


def read_pdf(data: bytes):
    reader = PdfReader(io.BytesIO(data))
    pages = []
    for n, page in enumerate(reader.pages, start=1):
        text = re.sub(r"[ \xa0\t]+", " ", page.extract_text() or "")
        if text.strip():
            pages.append((n, text))
    return pages


def chunk_text(text, size, overlap):
    """Sentence-aware packing (no mid-word cuts)."""
    sentences = [s.strip() for s in re.split(r"(?<=[.!?:])\s+|\n{2,}", text) if s.strip()]
    chunks, cur, cur_len = [], [], 0
    for s in sentences:
        if cur and cur_len + len(s) + 1 > size:
            chunks.append(" ".join(cur))
            tail, tl = [], 0
            for x in reversed(cur):
                if tl + len(x) > overlap:
                    break
                tail.insert(0, x); tl += len(x) + 1
            cur, cur_len = tail, tl
        cur.append(s); cur_len += len(s) + 1
    if cur:
        chunks.append(" ".join(cur))
    return chunks


def _context_for(doc_overview: str, chunk: str) -> str:
    """One short 'situating context' sentence for a chunk (contextual retrieval)."""
    return fast(
        system="You situate a chunk within its document for search. Reply with ONE short "
               "sentence of context (who/what/when it refers to). No preamble.",
        prompt=f"<document>\n{doc_overview[:1500]}\n</document>\n\n<chunk>\n{chunk[:600]}\n</chunk>",
        max_tokens=60)


def ingest_pdf(filename: str, data: bytes) -> int:
    pages = read_pdf(data)
    overview = " ".join(t for _, t in pages)[:1500]  # cheap doc summary = first 1500 chars

    rows = []  # (content, context, source, page)
    for page_number, page_text in pages:
        for chunk in chunk_text(page_text, settings.chunk_size, settings.chunk_overlap):
            ctx = _context_for(overview, chunk)
            rows.append((chunk, ctx, filename, page_number))
            time.sleep(0.2)  # gentle on Groq's free rate limit

    with get_conn() as conn:
        cur = conn.execute("insert into rl_documents (filename) values (%s) returning id::text",
                           (filename,))
        doc_id = cur.fetchone()[0]
        # Two embeddings per chunk: advanced = context+content (contextual retrieval),
        # naive = content only. Comparing them is how the lab proves contextual
        # retrieval's value — the naive baseline never sees the situating context.
        BATCH = 32
        for i in range(0, len(rows), BATCH):
            batch = rows[i:i + BATCH]
            adv = embed([f"{ctx}\n{content}" for content, ctx, _, _ in batch])
            naive = embed([content for content, _, _, _ in batch])
            for (content, ctx, source, page), va, vn in zip(batch, adv, naive):
                conn.execute(
                    "insert into rl_chunks (document_id, content, context, source, page, embedding, embedding_naive) "
                    "values (%s,%s,%s,%s,%s,%s,%s)", (doc_id, content, ctx, source, page, va, vn))
            if i + BATCH < len(rows):
                time.sleep(1.5)
    return len(rows)


def list_documents():
    with get_conn() as conn:
        cur = conn.execute(
            "select d.filename, count(c.id) from rl_documents d "
            "left join rl_chunks c on c.document_id=d.id group by d.id order by d.created_at")
        return [{"filename": r[0], "chunks": r[1]} for r in cur.fetchall()]
