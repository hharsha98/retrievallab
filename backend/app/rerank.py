"""Cross-encoder reranking via FlashRank (ONNX ms-marco-MiniLM — ~90MB, no torch,
~160ms for 20 passages on CPU). A cross-encoder reads (query, passage) *together*
and scores true relevance — far more precise than bi-encoder vector similarity.
This is the single highest-leverage upgrade in the advanced-RAG ladder.
"""
from flashrank import Ranker, RerankRequest

# one shared model instance (loaded once, warmed at Docker build)
_ranker = Ranker(model_name="ms-marco-MiniLM-L-12-v2")


def rerank(query: str, candidates: list[dict], top_k: int) -> list[dict]:
    """Re-sort candidates by cross-encoder relevance. Each candidate keeps its
    prior hybrid rank so the UI can show what moved (`hybrid_rank` → new order)."""
    if not candidates:
        return []
    passages = [{"id": i, "text": c["content"], "meta": c} for i, c in enumerate(candidates)]
    ranked = _ranker.rerank(RerankRequest(query=query, passages=passages))
    out = []
    for new_rank, r in enumerate(ranked[:top_k]):
        c = dict(r["meta"])
        c["rerank_score"] = round(float(r["score"]), 4)
        c["new_rank"] = new_rank
        out.append(c)
    return out
