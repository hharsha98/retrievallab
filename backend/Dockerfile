# RetrievalLab backend — same container shape as CareerAgent.
FROM python:3.12-slim

WORKDIR /code
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
# Warm the FlashRank model at build time so first request isn't slow.
RUN python -c "from flashrank import Ranker; Ranker(model_name='ms-marco-MiniLM-L-12-v2')" || true

EXPOSE 7860
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
