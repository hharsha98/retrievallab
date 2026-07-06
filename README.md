# RetrievalLab — advanced RAG, made visible

The retrieval techniques that 2026 job postings actually ask for — **contextual
chunking, hybrid search, cross-encoder reranking, query transformation, and
retrieval evaluation** — assembled into one pipeline you can *watch work*.

> Naive RAG (chunk → embed → top-k cosine → stuff into prompt) is the right start
> and the wrong finish. RetrievalLab shows the upgrades that separate a demo from
> production, and measures whether they actually help.

## The pipeline

```
question
  → query transformation   (HyDE probe + decomposition)
  → hybrid retrieval        (vector on the question + vector on the HyDE probe + BM25, fused with RRF)
  → cross-encoder rerank    (FlashRank / ms-marco-MiniLM — no torch, CPU-fast)
  → grounded answer         (with citations)
```

Ingestion uses **contextual retrieval** (Anthropic's technique): before embedding,
an LLM writes a one-sentence context that situates each chunk in its document, so a
chunk about "the second phase" still retrieves for "the Berlin rollout".

## What you can see

- **Pipeline Inspector** — ask anything and watch every stage: the HyDE probe, the
  20 hybrid candidates with their *vector rank vs keyword rank*, and the rerank step
  visibly promoting chunks (e.g. hybrid-rank 11 → position 1).
- **Compare** — the naive answer vs the advanced answer, side by side.
- **Eval** — recall@k and MRR for naive vs advanced on a hand-labelled set. On the
  built-in demo corpus, advanced retrieves the answer for **100% of questions vs
  naive's 86%** — naive is fooled by a near-duplicate "legacy model" decoy that the
  advanced path disambiguates.

## Honest notes (the eval-literacy part)

Reranking's benefit is largest when narrowing top-50–100 candidates from a **large,
messy** corpus; on a small clean corpus a strong embedding model already does well,
so the advanced margin is modest. Measuring that — instead of assuming advanced is
always better — is the point. RAGAS-style metrics are the next step.

## Stack

FastAPI · Supabase pgvector · Mistral embeddings · Groq (fast pipeline steps) ·
FlashRank · React + Vite + Tailwind. Free tiers throughout — €0/month. Reuses the
same infrastructure as [CareerAgent](https://github.com/hharsha98/careeragent).

## Run locally

```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env      # same keys as CareerAgent
uvicorn app.main:app --reload --port 7860
```
