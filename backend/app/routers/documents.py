"""Upload + list documents for the lab."""
from fastapi import APIRouter, HTTPException, UploadFile

from app.ingest import ingest_pdf, list_documents, read_pdf

router = APIRouter(prefix="/api/documents", tags=["documents"])

MAX_BYTES = 5 * 1024 * 1024
MAX_PAGES = 20


@router.get("")
def documents():
    return list_documents()


@router.post("", status_code=201)
async def upload(file: UploadFile):
    data = await file.read()
    if not data.startswith(b"%PDF"):
        raise HTTPException(422, "Only PDF files are accepted")
    if len(data) > MAX_BYTES:
        raise HTTPException(413, "PDF too large (max 5 MB)")
    if len(read_pdf(data)) > MAX_PAGES:
        raise HTTPException(413, f"Too many pages (max {MAX_PAGES})")
    chunks = ingest_pdf(file.filename, data)
    return {"filename": file.filename, "chunks": chunks}
