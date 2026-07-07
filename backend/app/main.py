"""RetrievalLab backend — FastAPI entry. Docs disabled in prod (same security
posture as CareerAgent). Seeds the synthetic demo corpus on first boot.
"""
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import documents, evals, query

STARTED_AT = time.monotonic()


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        from app.demo import is_empty, seed
        if is_empty():
            seed()
            print("demo corpus seeded")
    except Exception as e:
        print(f"demo seed skipped: {e}")
    yield


_docs = ({"docs_url": None, "redoc_url": None, "openapi_url": None}
         if settings.env == "prod" else {})

app = FastAPI(title="RetrievalLab API", version="0.1.0", lifespan=lifespan, **_docs)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    # In prod, accept any Cloudflare Pages URL for this project (production +
    # preview deploys) so a hostname suffix can't break CORS — the lesson from
    # CareerAgent's config-drift bug. Synthetic-corpus demo, so this is safe.
    allow_origin_regex=r"https://.*retrievallab.*\.pages\.dev" if settings.env == "prod" else None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(documents.router)
app.include_router(query.router)
app.include_router(evals.router)


@app.get("/api/health")
def health():
    return {"status": "ok", "version": app.version, "env": settings.env,
            "uptime_seconds": round(time.monotonic() - STARTED_AT, 1)}
