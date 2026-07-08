"""Utilities for uploading profile assets to Amazon S3.

This module exposes an `S3Uploader` class and a default `uploader`
instance for convenience. The class groups upload and URL helper
functions that previously lived as top-level functions.
"""

import aioboto3
import asyncio
import boto3
import json
import logging
import requests as re

from uuid import uuid4
from urllib.parse import urlparse

from botocore.exceptions import BotoCoreError, ClientError
from fastapi import UploadFile

from .media_fraud_checker import image_fraud_checker, video_fraud_checker
from utils.responses import function_response
from utils.settings import settings

logger = logging.getLogger("home_buddy.s3")

# Maximum allowed size for profile images (bytes)
MAX_PROFILE_IMAGE_BYTES = 1 * 1024 * 1024  # 1 MB


class S3Uploader:
    """Encapsulates S3 upload and URL helpers.

    Use the instance methods; a default `uploader` is provided below.
    """

    def __init__(self):

        cfg = settings
    
        self.bucket_name = cfg.aws_s3_bucket
        self.aws_region = cfg.aws_region
        self.access_key = cfg.aws_access_key_id
        self.secret_key = cfg.aws_secret_access_key

    def upload_listing_media(self, listing_id: str, media_name: str, media: UploadFile):
        """ a method to upload a listing to amazon s3 bucket and get the result of the ai fraud detector scan
        Args:
            listing_id: the id of the seller having the listing
            media_type: the type of the media to upload
            media: the media file to upload
        """

        from database.db_engine import storage

        # upload the file to amazon s3 bucket
        if not media:
            return
        
        key = f"listings/{listing_id}/{media_name}.{media.filename.split(".")[-1]}"

        try:
            client = boto3.client(
                "s3", region_name = self.aws_region,
                aws_access_key_id = self.access_key,
                aws_secret_access_key = self.secret_key
            )
                # upload the file to the s3 bucket
            client.upload_fileobj(media.file, self.bucket_name, key)
            clean_url = client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket_name, 'Key': key},
                ExpiresIn=30
            )
            print(clean_url, "=" * 80)
        except Exception as e:
            # log the exception for future debugging
            logger.error(e)
            return

        if not clean_url:
            return
        logger.info(clean_url)
        
        # pass the presigned clean url to the ai fraud detector
        if media.filename.endswith((".mp4", ".mov")):
            output = asyncio.run(video_fraud_checker(clean_url, media))
        elif media.filename.endswith(".pdf"):
            output = {"status": "success"}
        else:
            output = asyncio.run(image_fraud_checker(clean_url))

        needed_output = {
            "status": output.get("status", "unknown"),
            "confidence": output.get("type", {}).get("ai_generated", 0)
        }
        if media.filename.endswith((".mp4", ".mov")):
            needed_output["type"] = "movie"
        elif media.filename.endswith(".pdf"):
            needed_output["type"] = "pdf"
        else:
            needed_output["type"] = "image"

        # save the url and ai analysis to the database
        asyncio.run(storage.save_listing_media(listing_id, media_name, key, needed_output))
        

    async def _upload_object(self, uploaded_file: UploadFile, object_key: str):
        """Internal helper that uploads a file object to S3 by key."""

        try:
            session = aioboto3.Session()
            extra_args = {"ContentType": uploaded_file.content_type}
            async with session.client(
                "s3",
                region_name=self.aws_region,
                aws_access_key_id=self.access_key,
                aws_secret_access_key=self.secret_key,
            ) as client:
                await client.upload_fileobj(uploaded_file.file, self.bucket_name, object_key, ExtraArgs=extra_args)

            public_url = f"https://{self.bucket_name}.s3.{self.aws_region}.amazonaws.com/{object_key}"
            return function_response(True, {"url": public_url, "key": object_key})
        except (BotoCoreError, ClientError, Exception) as e:
            logger.exception("Failed to upload file to S3: %s", e)
            return function_response(False)
        finally:
            try:
                uploaded_file.file.close()
            except Exception:
                pass

    async def delete_object(self, object_key: str):
        """Delete an S3 object by key."""

        if not object_key:
            return function_response(False)

        try:
            session = aioboto3.Session()
            async with session.client(
                "s3",
                region_name=self.aws_region,
                aws_access_key_id=self.access_key,
                aws_secret_access_key=self.secret_key,
            ) as client:
                await client.delete_object(Bucket=self.bucket_name, Key=object_key)

            return function_response(True, {"key": object_key})
        except (BotoCoreError, ClientError, Exception) as e:
            logger.exception("Failed to delete file from S3: %s", e)
            return function_response(False)

    async def upload_profile_image(self, uploaded_file: UploadFile, user_id: str):
        """Upload a user profile image to the shared `profile_image/{user_id}` key."""

        file_extension = uploaded_file.filename.split(".")[-1]
        if not file_extension:
            return function_response(False)

        # Enforce maximum profile image size
        file_obj = getattr(uploaded_file, "file", None)
        size = None
        if file_obj is not None:
            try:
                current_pos = file_obj.tell()
                file_obj.seek(0, 2)  # seek to end
                size = file_obj.tell()
                file_obj.seek(0)
            except Exception:
                size = None

        if size is not None and size >= MAX_PROFILE_IMAGE_BYTES:
            return function_response(False, {"error": "file_too_large", "max_bytes": MAX_PROFILE_IMAGE_BYTES, "size": size})

        object_key = f"profile_image/{user_id}"
        return await self._upload_object(uploaded_file, object_key)

    async def replace_profile_image(self, uploaded_file: UploadFile, user_id: str, existing_object_key: str | None = None):
        """Replace a profile image in S3 by deleting any existing object first."""

        if existing_object_key:
            delete_response = await self.delete_object(existing_object_key)
            if not delete_response.status:
                return delete_response

        return await self.upload_profile_image(uploaded_file, user_id)

    async def upload_house_image(self, uploaded_file: UploadFile, listing_id: str, group_name: str, index: int, filename_override: str | None = None):
        """Upload a listing/house image to the `listings/{listing_id}/` folder.

        The caller may pass `filename_override` (without extension) to force the
        stored object name (e.g. `bathroom_1`). If not provided the original
        uploaded filename is used.
        """

        file_extension = uploaded_file.filename.split(".")[-1]
        if not file_extension:
            return function_response(False)

        # Choose a base name: prefer explicit override, otherwise the
        # uploaded filename, otherwise a fallback based on group and index.
        if filename_override:
            safe_base = filename_override
        else:
            safe_base = uploaded_file.filename or f"{group_name}_{index}"

        # Ensure the filename ends with the correct extension (avoid double-extension)
        if safe_base.lower().endswith(file_extension):
            filename = safe_base
        else:
            filename = f"{safe_base}{file_extension}"

        object_key = f"listings/{listing_id}/{filename}"
        return await self._upload_object(uploaded_file, object_key)

    def get_listing_folder_url(self, listing_id: str) -> str:
        """Return a public URL pointing to the listing folder prefix.

        Note: S3 does not have real folders; this returns the prefix URL that
        can be used as a base for stored objects.
        """
        return f"https://{self.bucket_name}.s3.{self.aws_region}.amazonaws.com/listings/{listing_id}/"

    async def upload_verification_image(self, uploaded_file: UploadFile, user_id: str, kind: str):
        """Upload verification documents/images to `seller-profiles/{user_id}`.

        `kind` is a short descriptor such as `proof-of-address`, `id-front`, `id-back`.
        """

        file_extension = uploaded_file.filename.split(".")[-1]
        if not file_extension:
            return function_response(False)

        safe_name = uploaded_file.filename or kind
        object_key = f"seller-profiles/{user_id}/{kind}_{uuid4().hex}_{safe_name}{file_extension if not safe_name.lower().endswith(file_extension) else ''}"
        return await self._upload_object(uploaded_file, object_key)

    def extract_s3_key_from_url(self, s3_url: str | None) -> str | None:
        """Extract an S3 object key from a standard S3 HTTPS URL."""

        if not s3_url:
            return None

        parsed = urlparse(s3_url)
        if not parsed.path:
            return None

        return parsed.path.lstrip("/") or None

    async def generate_presigned_get_url(self, object_key: str | None, expires_in: int = 3600):
        """Generate a presigned URL for an S3 object."""

        # Use cached instance attributes
        bucket_name = self.bucket_name
        aws_region = self.aws_region
        access_key = self.access_key
        secret_key = self.secret_key

        # Only require an object_key here; credentials/config are supplied
        # via the settings object and not re-validated in this helper.
        if not object_key:
            return None
        try:
            session = aioboto3.Session()
            async with session.client(
                "s3",
                region_name=aws_region,
                aws_access_key_id=access_key,
                aws_secret_access_key=secret_key,
            ) as client:
                return await client.generate_presigned_url(
                    "get_object",
                    Params={"Bucket": bucket_name, "Key": object_key},
                    ExpiresIn=expires_in,
                )
        except Exception:
            logger.exception("Failed to generate presigned S3 URL for key %s", object_key)
            return None

    async def resolve_accessible_s3_url(self, stored_url: str | None, object_key: str | None = None, expires_in: int = 3600):
        """Return a browser-loadable URL for a stored S3 object reference."""

        resolved_key = object_key or self.extract_s3_key_from_url(stored_url)
        presigned_url = await self.generate_presigned_get_url(resolved_key, expires_in=expires_in)
        return presigned_url or stored_url


# Default instance for convenience in call sites
uploader = S3Uploader()
