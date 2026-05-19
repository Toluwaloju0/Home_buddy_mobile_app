"""Utilities for uploading profile assets to Amazon S3."""

from uuid import uuid4
import logging

import aioboto3
from botocore.exceptions import BotoCoreError, ClientError
from fastapi import UploadFile

from utils.responses import function_response
from utils.settings import settings

logger = logging.getLogger("home_buddy.s3")

ALLOWED_PROFILE_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "application/pdf": ".pdf",
}


async def upload_file_to_s3(uploaded_file: UploadFile, folder: str, prefix: str):
    """Upload a file to S3 and return its public URL."""

    bucket_name = settings.aws_s3_bucket
    aws_region = settings.aws_region
    access_key = settings.aws_access_key_id
    secret_key = settings.aws_secret_access_key

    if not bucket_name or not access_key or not secret_key:
        return function_response(False)

    file_extension = ALLOWED_PROFILE_IMAGE_TYPES.get(uploaded_file.content_type)
    if not file_extension:
        return function_response(False)

    safe_name = uploaded_file.filename or "upload"
    object_key = f"{folder}/{prefix}_{uuid4().hex}_{safe_name}{file_extension if not safe_name.lower().endswith(file_extension) else ''}"

    try:
        session = aioboto3.Session()
        extra_args = {"ContentType": uploaded_file.content_type}
        # extra_args["ACL"] = "public-read"

        async with session.client(
            "s3",
            region_name=aws_region,
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
        ) as client:
            await client.upload_fileobj(uploaded_file.file, bucket_name, object_key, ExtraArgs=extra_args)

        public_url = f"https://{bucket_name}.s3.{aws_region}.amazonaws.com/{object_key}"
        return function_response(True, {"url": public_url, "key": object_key})
    except (BotoCoreError, ClientError, Exception) as e:
        logger.exception("Failed to upload file to S3: %s", e)
        return function_response(False)
    finally:
        try:
            uploaded_file.file.close()
        except Exception:
            pass
