"""The pipeline endpoint — returns the full stage-by-stage trace for the Inspector."""
from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.pipeline import run_query

router = APIRouter(prefix="/api", tags=["query"])


class QueryRequest(BaseModel):
    question: str = Field(min_length=1, max_length=2000)


@router.post("/query")
def query(req: QueryRequest):
    return run_query(req.question)
