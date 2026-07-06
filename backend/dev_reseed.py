"""Dev helper: wipe the synthetic demo corpus, re-seed it, and print eval numbers.
Run: ./venv/bin/python dev_reseed.py   (local only; not shipped in the image path)
"""
from app.db import get_conn
from app.demo import seed
from app.ingest import list_documents
from app.evals import run_eval

with get_conn() as conn:
    conn.execute("truncate rl_documents cascade")
seed()
print("chunks:", list_documents())

r = run_eval()
print("NAIVE:   ", r["naive"])
print("ADVANCED:", r["advanced"])
for c in r["cases"]:
    flag = "UP" if c["improved"] else "  "
    print(f"  {flag} naive#{c['naive_rank']} adv#{c['advanced_rank']}  {c['question'][:44]}")
