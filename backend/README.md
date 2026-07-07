---
title: RetrievalLab API
emoji: 🔎
colorFrom: green
colorTo: blue
sdk: docker
app_port: 7860
pinned: false
---

# RetrievalLab — backend

FastAPI backend for [RetrievalLab](https://github.com/hharsha98/retrievallab): an
advanced-RAG pipeline (contextual chunking, hybrid search, cross-encoder reranking,
query transformation) with a retrieval eval. Deployed as a Docker Space; secrets are
set as Space secrets (see `.env.example`). Reuses the same Supabase/Mistral/Groq as
CareerAgent.
