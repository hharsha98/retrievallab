"""Retrieval eval endpoint (recall@k + MRR, naive vs advanced) + demo reseed."""
from fastapi import APIRouter

from app.demo import is_empty, seed
from app.evals import run_eval

router = APIRouter(prefix="/api", tags=["evals"])


@router.post("/eval")
def evaluate():
    return run_eval()


@router.post("/seed")
def reseed():
    if is_empty():
        seed()
        return {"seeded": True}
    return {"seeded": False, "reason": "corpus already populated"}
