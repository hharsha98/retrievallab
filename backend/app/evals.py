"""Retrieval evaluation — the eval-literacy showpiece.

For each hand-labelled question we run BOTH retrievers and check whether a chunk
containing the expected answer made it into the top-k:
  • naive     = pure vector search
  • advanced  = hybrid (vector+BM25) → cross-encoder rerank
We report recall@k (did we retrieve the answer at all?) and MRR (how high?).
Advanced should beat naive — that delta is the whole point.
"""
import json
import pathlib

from app.config import settings
from app.pipeline import hybrid, hyde, vector_only
from app.rerank import rerank

QUESTIONS = json.loads((pathlib.Path(__file__).parent / "questions.json").read_text())


def _first_hit_rank(chunks, needle: str):
    """1-based rank of the first chunk whose text contains the expected answer, else None."""
    needle = needle.lower()
    for i, c in enumerate(chunks, 1):
        if needle in c["content"].lower():
            return i
    return None


def _metrics(ranks, k):
    hits = [r for r in ranks if r is not None and r <= k]
    recall = len(hits) / len(ranks) if ranks else 0.0
    mrr = sum(1 / r for r in ranks if r) / len(ranks) if ranks else 0.0
    return {"recall_at_k": round(recall, 3), "mrr": round(mrr, 3), "k": k}


def run_eval() -> dict:
    k = settings.final_k
    naive_ranks, adv_ranks, cases = [], [], []

    for q in QUESTIONS:
        question, needle = q["question"], q["answer_contains"]

        naive = vector_only(question, k)
        adv = rerank(question, hybrid(question, hyde(question), question, settings.candidates_k), k)

        nr = _first_hit_rank(naive, needle)
        ar = _first_hit_rank(adv, needle)
        naive_ranks.append(nr)
        adv_ranks.append(ar)
        cases.append({"question": question, "expected": needle,
                      "naive_rank": nr, "advanced_rank": ar,
                      "improved": (ar or 99) < (nr or 99)})

    return {
        "k": k,
        "naive": _metrics(naive_ranks, k),
        "advanced": _metrics(adv_ranks, k),
        "cases": cases,
    }
