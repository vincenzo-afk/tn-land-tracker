"""
services/r2_storage.py — Cloudflare R2 handler.
Uploads FMB sketches and returns public CDN URL.
Uses boto3 with S3-compatible endpoint.
"""
from __future__ import annotations
import logging
import os
from typing import Optional

import boto3
from botocore.exceptions import BotoCoreError, ClientError

logger = logging.getLogger(__name__)

R2_ACCOUNT_ID   = os.getenv("R2_ACCOUNT_ID", "")
R2_ACCESS_KEY   = os.getenv("R2_ACCESS_KEY", "")
R2_SECRET_KEY   = os.getenv("R2_SECRET_KEY", "")
R2_BUCKET       = os.getenv("R2_BUCKET", "tn-land-tracker-fmb")
R2_PUBLIC_URL   = os.getenv("R2_PUBLIC_URL", "")  # e.g. https://pub-xxx.r2.dev

_s3_client = None


def _get_client():
    global _s3_client
    if _s3_client is None:
        _s3_client = boto3.client(
            "s3",
            endpoint_url=f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
            aws_access_key_id=R2_ACCESS_KEY,
            aws_secret_access_key=R2_SECRET_KEY,
            region_name="auto",
        )
    return _s3_client


async def upload_fmb_to_r2(
    key: str,
    data: bytes,
    content_type: str = "application/pdf",
) -> Optional[str]:
    """
    Upload file bytes to Cloudflare R2.
    Returns the public CDN URL, or None on error.
    """
    if not R2_ACCOUNT_ID or not R2_ACCESS_KEY:
        logger.warning("R2 credentials not configured. Skipping upload.")
        return None

    try:
        client = _get_client()
        client.put_object(
            Bucket=R2_BUCKET,
            Key=key,
            Body=data,
            ContentType=content_type,
        )
        # Build public URL
        if R2_PUBLIC_URL:
            url = f"{R2_PUBLIC_URL.rstrip('/')}/{key}"
        else:
            url = f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com/{R2_BUCKET}/{key}"
        logger.info("Uploaded FMB to R2: %s", url)
        return url

    except (BotoCoreError, ClientError) as exc:
        logger.error("R2 upload failed for key %s: %s", key, exc)
        return None
