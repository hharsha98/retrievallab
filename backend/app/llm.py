"""Thin LLM helpers — Mistral for embeddings + final answers, Groq for the fast
pipeline steps (HyDE, decomposition, contextual chunking). Same OpenAI-compatible
client pattern as CareerAgent.
"""
from openai import OpenAI

from app.config import settings


def _mistral() -> OpenAI:
    return OpenAI(api_key=settings.mistral_api_key, base_url=settings.mistral_base_url)


def _groq() -> OpenAI:
    return OpenAI(api_key=settings.groq_api_key, base_url=settings.groq_base_url)


def embed(texts: list[str]) -> list[list[float]]:
    resp = _mistral().embeddings.create(model=settings.embed_model, input=texts)
    return [d.embedding for d in resp.data]


def fast(prompt: str, system: str = "", max_tokens: int = 400) -> str:
    """One quick Groq completion (falls back to Mistral if Groq is down)."""
    messages = ([{"role": "system", "content": system}] if system else []) + \
        [{"role": "user", "content": prompt}]
    try:
        r = _groq().chat.completions.create(
            model=settings.fast_model, temperature=0, max_tokens=max_tokens, messages=messages)
    except Exception:
        r = _mistral().chat.completions.create(
            model=settings.answer_model, temperature=0, max_tokens=max_tokens, messages=messages)
    return (r.choices[0].message.content or "").strip()


def answer(question: str, chunks: list[dict]) -> str:
    """Grounded answer with citations (same rules as CareerAgent chat)."""
    if not chunks:
        return "I couldn't find that in the documents."
    context = "\n\n".join(
        f"[{i}] (from {c['source']}, page {c['page']})\n{c['content']}"
        for i, c in enumerate(chunks, 1))
    system = (
        "Answer ONLY using the numbered context passages. If the answer is not there, "
        "say \"I couldn't find that in the documents.\" Cite each fact like [1] or [2]. Be concise.")
    r = _mistral().chat.completions.create(
        model=settings.answer_model, temperature=0,
        messages=[{"role": "system", "content": system},
                  {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {question}"}])
    return (r.choices[0].message.content or "").strip()
