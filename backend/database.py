"""
database.py — Supabase PostgreSQL connection via asyncpg.
"""
import os
import asyncpg
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL: str = os.environ["SUPABASE_URL"]

_pool: asyncpg.Pool | None = None


async def get_pool() -> asyncpg.Pool:
    """Return (or lazily create) the shared asyncpg connection pool."""
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(
            dsn=DATABASE_URL,
            min_size=1,
            max_size=10,
            command_timeout=30,
        )
    return _pool


async def close_pool() -> None:
    """Close the connection pool on app shutdown."""
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None
