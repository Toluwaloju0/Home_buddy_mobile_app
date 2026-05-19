"""Utilities for storing listing proof images locally."""

from datetime import datetime
from pathlib import Path
from uuid import uuid4

import aiofiles
from fastapi import UploadFile

from utils.responses import function_response

LISTING_UPLOAD_ROOT = Path(__file__).resolve().parents[1] / "uploads" / "listings"
ALLOWED_IMAGE_CONTENT_TYPES = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}


async def store_listing_images(seller_id: str, submission_id: str, listing_images: list[UploadFile]):
    """Store uploaded listing images locally and return public file paths."""

    try:
        if not listing_images:
            return function_response(False)

        target_dir = LISTING_UPLOAD_ROOT / seller_id / submission_id
        target_dir.mkdir(parents=True, exist_ok=True)

        stored_images = []
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")

        for index, uploaded_file in enumerate(listing_images):
            file_extension = ALLOWED_IMAGE_CONTENT_TYPES.get(uploaded_file.content_type)
            if not file_extension:
                return function_response(False)

            stored_name = f"{timestamp}_{index}_{uuid4().hex}{file_extension}"
            file_path = target_dir / stored_name

            async with aiofiles.open(file_path, "wb") as destination:
                while True:
                    chunk = await uploaded_file.read(1024 * 1024)
                    if not chunk:
                        break
                    await destination.write(chunk)

            stored_images.append(
                {
                    "filename": stored_name,
                    "content_type": uploaded_file.content_type,
                    "url": f"/uploads/listings/{seller_id}/{submission_id}/{stored_name}",
                }
            )

        return function_response(
            True,
            {
                "submission_id": submission_id,
                "directory": f"/uploads/listings/{seller_id}/{submission_id}",
                "images": stored_images,
            },
        )
    except Exception:
        return function_response(False)
    finally:
        for uploaded_file in listing_images:
            try:
                uploaded_file.file.close()
            except Exception:
                pass