"""One connection per request with pgvector types registered (same as CareerAgent)."""
from contextlib import contextmanager

import psycopg
from pgvector.psycopg import register_vector

from app.config import settings


@contextmanager
def get_conn():
    # prepare_threshold=None disables psycopg's auto-prepared-statements, which
    # Supabase's transaction pooler (pgbouncer) does not support — without this,
    # repeated queries on one pooled connection raise DuplicatePreparedStatement.
    with psycopg.connect(settings.database_url, prepare_threshold=None) as conn:
        register_vector(conn)
        yield conn
