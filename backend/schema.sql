-- RetrievalLab schema. Run ONCE in the Supabase SQL editor.
-- Separate `rl_` tables so it shares the existing Supabase project at €0.
create extension if not exists vector;

create table rl_documents (
  id          uuid primary key default gen_random_uuid(),
  filename    text not null,
  created_at  timestamptz not null default now()
);

create table rl_chunks (
  id           uuid primary key default gen_random_uuid(),
  document_id  uuid not null references rl_documents(id) on delete cascade,
  content      text not null,          -- the chunk text
  context      text not null default '',-- LLM-generated "situating context" (contextual retrieval)
  source          text not null,       -- filename, for citations
  page            int  not null,
  embedding       vector(1024),         -- ADVANCED: embedding of (context + content)
  embedding_naive vector(1024)          -- NAIVE baseline: embedding of content only
);
create index rl_chunks_embedding_idx on rl_chunks using hnsw (embedding vector_cosine_ops);
create index rl_chunks_naive_idx on rl_chunks using hnsw (embedding_naive vector_cosine_ops);
