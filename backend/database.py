"""
database.py — Supabase PostgreSQL connection via asyncpg.
"""
import os
import asyncpg
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL: str = os.getenv("SUPABASE_URL", "")

_pool: asyncpg.Pool | None = None


async def get_pool() -> asyncpg.Pool | None:
    """Return (or lazily create) the shared asyncpg connection pool."""
    global _pool
    if _pool is None and DATABASE_URL and "YOUR_" not in DATABASE_URL:
        try:
            _pool = await asyncpg.create_pool(
                dsn=DATABASE_URL,
                min_size=1,
                max_size=10,
                command_timeout=30,
            )
        except Exception as err:
            print(f"Supabase DB connection skipped/failed: {err}")
            _pool = None
    return _pool


async def close_pool() -> None:
    """Close the connection pool on app shutdown."""
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None
