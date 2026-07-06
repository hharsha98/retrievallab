"""Settings — mirrors CareerAgent's config so keys/env names are identical.
Reuses the same Supabase project (separate `rl_` tables) and the same Mistral +
Groq keys, so RetrievalLab costs nothing extra to run.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    mistral_api_key: str = ""
    groq_api_key: str = ""
    database_url: str = ""

    env: str = "dev"
    frontend_origin: str = "http://localhost:5175"

    # Models — Mistral for embeddings + final answer, Groq for fast pipeline steps
    embed_model: str = "mistral-embed"            # 1024-dim
    answer_model: str = "mistral-small-latest"
    fast_model: str = "llama-3.3-70b-versatile"   # Groq: HyDE, decomposition, context
    mistral_base_url: str = "https://api.mistral.ai/v1"
    groq_base_url: str = "https://api.groq.com/openai/v1"

    # Retrieval knobs
    chunk_size: int = 380    # smaller chunks → a realistic haystack where top-k is selective
    chunk_overlap: int = 60
    candidates_k: int = 20   # hybrid retrieves this many …
    final_k: int = 5         # … reranker narrows to this many


settings = Settings()
