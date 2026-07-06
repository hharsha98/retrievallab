"""The advanced-RAG query pipeline, instrumented so every stage is visible:

  query
    → query transformation (HyDE + decomposition)
    → hybrid retrieval (vector + BM25, fused with Reciprocal Rank Fusion)
    → cross-encoder reranking (FlashRank)
    → grounded answer with citations

run_query() returns the FULL trace so the UI can render each stage. It also runs
a NAIVE path (pure vector, no transform/rerank) on the same question, so the two
can be compared side by side — the whole point of the lab.
"""
import time

from app.config import settings
from app.db import get_conn
from app.llm import answer, embed, fast
from app.rerank import rerank


# ---- query transformation --------------------------------------------------

def hyde(question: str) -> str:
    """HyDE: write a hypothetical answer; its embedding often matches real
    passages better than the terse question does."""
    return fast(
        system="Write a short, plausible 2-3 sentence passage that would answer the question. "
               "It doesn't need to be true — it's used only as a search probe.",
        prompt=question, max_tokens=160)


def decompose(question: str) -> list[str]:
    """Split a multi-part question into sub-questions (shown in the UI; also
    broadens BM25 recall)."""
    out = fast(
        system="If the question has multiple parts, list each as a separate short sub-question, "
               "one per line. If it's already simple, return it unchanged. No numbering, no preamble.",
        prompt=question, max_tokens=120)
    subs = [s.strip("-• ").strip() for s in out.splitlines() if s.strip()]
    return subs[:4] or [question]


# ---- retrieval -------------------------------------------------------------

def _all_chunks(conn):
    cur = conn.execute("select id::text, content, context, source, page from rl_chunks")
    return [{"id": r[0], "content": r[1], "context": r[2], "source": r[3], "page": r[4]}
            for r in cur.fetchall()]


def vector_only(question: str, k: int) -> list[dict]:
    """Naive baseline: embed the raw question, pure cosine top-k over the
    content-only embeddings (no contextual retrieval, no hybrid, no rerank)."""
    v = embed([question])[0]
    with get_conn() as conn:
        cur = conn.execute(
            "select id::text, content, source, page from rl_chunks "
            "order by embedding_naive <=> %s::vector limit %s", (v, k))
        return [{"id": r[0], "content": r[1], "source": r[2], "page": r[3]} for r in cur.fetchall()]


def _vector_ranks(conn, probe_vec, limit):
    cur = conn.execute(
        "select id::text from rl_chunks order by embedding <=> %s::vector limit %s",
        (probe_vec, limit))
    return {row[0]: rank for rank, row in enumerate(cur.fetchall())}


def hybrid(question: str, hyde_probe: str, keyword_query: str, k: int) -> list[dict]:
    """Fuse three retrieval signals with Reciprocal Rank Fusion:
      • vector on the QUESTION (over context-enriched embeddings) — the reliable base
      • vector on the HyDE probe — an EXTRA recall source (can only help, never replace)
      • BM25 keyword — catches exact terms (part numbers, cert IDs) vectors miss
    Candidates carry each rank so the UI can show where they came from."""
    from rank_bm25 import BM25Okapi

    q_vec, h_vec = embed([question, hyde_probe])
    with get_conn() as conn:
        chunks = _all_chunks(conn)
        n = len(chunks)
        if n == 0:
            return []
        lim = min(k * 3, n)
        vector_rank = _vector_ranks(conn, q_vec, lim)
        hyde_rank = _vector_ranks(conn, h_vec, lim)

    bm25 = BM25Okapi([f"{c['context']} {c['content']}".lower().split() for c in chunks])
    scores = bm25.get_scores(keyword_query.lower().split())
    keyword_rank = {chunks[i]["id"]: rank for rank, i in
                    enumerate(sorted(range(n), key=lambda i: -scores[i]))}

    def rrf(cid):
        return (1 / (60 + vector_rank.get(cid, n))
                + 1 / (60 + hyde_rank.get(cid, n))
                + 1 / (60 + keyword_rank.get(cid, n)))

    by_id = {c["id"]: c for c in chunks}
    best = sorted(by_id, key=rrf, reverse=True)[:k]
    out = []
    for hyb_rank, cid in enumerate(best):
        c = dict(by_id[cid])
        c["hybrid_rank"] = hyb_rank
        c["vector_rank"] = vector_rank.get(cid)
        c["keyword_rank"] = keyword_rank.get(cid)
        out.append(c)
    return out


# ---- full pipeline ---------------------------------------------------------

def run_query(question: str) -> dict:
    t0 = time.monotonic()

    probe = hyde(question)
    subs = decompose(question)
    keyword_query = " ".join([question] + subs)

    candidates = hybrid(question, probe, keyword_query, settings.candidates_k)
    reranked = rerank(question, candidates, settings.final_k)

    naive_chunks = vector_only(question, settings.final_k)
    naive_answer = answer(question, naive_chunks)
    advanced_answer = answer(question, reranked)

    def slim(c):
        return {"content": c["content"][:400], "context": c.get("context", ""),
                "source": c["source"], "page": c["page"],
                "hybrid_rank": c.get("hybrid_rank"), "vector_rank": c.get("vector_rank"),
                "keyword_rank": c.get("keyword_rank"), "new_rank": c.get("new_rank"),
                "rerank_score": c.get("rerank_score")}

    return {
        "original_query": question,
        "hyde": probe,
        "sub_queries": subs,
        "hybrid_candidates": [slim(c) for c in candidates],
        "reranked": [slim(c) for c in reranked],
        "naive_sources": [{"source": c["source"], "page": c["page"]} for c in naive_chunks],
        "naive_answer": naive_answer,
        "advanced_answer": advanced_answer,
        "elapsed_ms": int((time.monotonic() - t0) * 1000),
    }
