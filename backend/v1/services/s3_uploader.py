"""Utilities for uploading profile assets to Amazon S3.

This module exposes an `S3Uploader` class and a default `uploader`
instance for convenience. The class groups upload and URL helper
functions that previously lived as top-level functions.
"""

import asyncio
import boto3
import logging

from botocore.exceptions import BotoCoreError, ClientError
from fastapi import UploadFile

from .media_fraud_checker import image_fraud_checker, video_fraud_checker
from utils.settings import settings
from database.get_db import get_db
from database.db_engine import DBStorage

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

    def upload_listing_media(self, listing_id: str, media_name: str, media: UploadFile, storage: DBStorage):
        """ a method to upload a listing to amazon s3 bucket and get the result of the ai fraud detector scan
        Args:
            listing_id: the id of the seller having the listing
            media_type: the type of the media to upload
            media: the media file to upload
        """

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
            clean_url = self.create_url(key)
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

        # initialize the storage for this new thread and save the listing
        storage: DBStorage = get_db()

        # save the url and ai analysis to the database
        asyncio.run(storage.save_listing_media(listing_id, media_name, key, needed_output))

    def create_url(self, key):
        """ a method to create a presigned url for an already uploaded document
        Args:
            key: the key to the uploaded document in amazon s3 bucket
        Return: a url link to the document
        """

        if not key: return None

        try:
            client = boto3.client(
                "s3", region_name=self.aws_region,
                aws_access_key_id=self.access_key,
                aws_secret_access_key=self.secret_key
            )
            return client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket_name, 'Key': key},
                ExpiresIn=30
            )
        except Exception as e:
            logger.error(e)
            print(e)
            return None

    def delete_object(self, key: str):
        """ a method to delete the an object from a s3 bucket
        Args:
            key: the object key in the s3 bucket
        """

        if not key: return

        # initialize the bucket and call the delete_object method of the client
        client = boto3.client(
            "s3", region_name=self.aws_region,
            aws_access_key_id=self.access_key,
            aws_secret_access_key=self.secret_key
        )
        client.delete_object(Bucket=self.bucket_name, Key=key)

    def upload_profile_image(self, user_id: str, uploaded_file: UploadFile):
        """Upload a user profile image to the s3 bucket
        Args:
            user_id: the id of the user to upload the profile image for
            uploaded_file: the file object to upload
        """

        object_key = f"profile/{user_id}.{uploaded_file.filename.split('.')[-1]}"

        # upload the file to the s3 bucket
        try:
            client = boto3.client(
                "s3", region_name=self.aws_region,
                aws_access_key_id=self.access_key,
                aws_secret_access_key=self.secret_key
            )
            client.upload_fileobj(uploaded_file.file, self.bucket_name, object_key)

            return object_key

        except Exception as e:
            print(e)
            logger.error(e)

    def upload_seller_verification(self, user_id, id_front, id_back, storage: DBStorage):
        """ a method to upload seller verification images for admin review
        Args:
            id_front: the front of the id
            id_back: the back of the id
        """

        front_key = f"verify/{user_id}/id_front.{id_front.filename.split('.')[-1]}"
        back_key = f"verify/{user_id}/id_back.{id_back.filename.split('.')[-1]}"

        # upload the file to the s3 bucket
        try:
            client = boto3.client(
                "s3", region_name=self.aws_region,
                aws_access_key_id=self.access_key,
                aws_secret_access_key=self.secret_key
            )
            client.upload_fileobj(id_front.file, self.bucket_name, front_key)
            client.upload_fileobj(id_back.file, self.bucket_name, back_key)

            # ensure the images are not ai generated images

            asyncio.run(storage.update_seller_by_user_id(user_id, {"id_front_key": front_key, "id_back_key": back_key}))

        except Exception as e:
            print(e)
            logger.error(e)

# Default instance for convenience in call sites
uploader = S3Uploader()
