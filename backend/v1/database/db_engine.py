""" a module to define the database class for all database activities on the application """

from typing import Dict, List, Any
from bson import ObjectId
from argon2.exceptions import VerifyMismatchError
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import logging

from models.seller_model import Seller
from utils.responses import function_response
from utils.password import ph
from utils.settings import settings

logger = logging.getLogger("home_buddy.db_engine")

def safe_db_operation(fn):
    """Decorator to wrap DB operations: logs exceptions and returns a
    sanitized FunctionResponse(False) so callers get a consistent failure
    without losing stack traces to logs.
    """
    from functools import wraps

    @wraps(fn)
    async def wrapper(*args, **kwargs):
        try:
            return await fn(*args, **kwargs)
        except Exception:
            logger.exception("Unhandled exception in %s", fn.__name__)
            return function_response(False)

    return wrapper


class DBStorage:
    """The db storage class"""

    def __init__(self):
        """The initializer for the storage class.

        Uses a configurable Mongo URI (from settings.mongo_uri) and applies
        sensible connection timeouts and pool sizing for production.
        """

        mongo_uri = settings.mongo_uri
        self.__client = AsyncIOMotorClient(
            mongo_uri,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
            maxPoolSize=100,
        )

        self.__db = self.__client.get_database("Home_Buddy")
        self.__user = self.__db["users"]
        self.__admin = self.__db["admin"]
        self.__refresh_token = self.__db["refresh_token"]
        self.__otp_code = self.__db["otp_code"]
        self.__listings = self.__db["listings"]
        self.__seller = self.__db["sellers"]
        self.__buyer = self.__db["buyers"]

    async def ping(self) -> None:
        """Ping the database to validate connectivity."""
        await self.__client.admin.command("ping")

    async def init_indexes(self) -> None:
        """Initialize indexes for collections."""
        try:
            await self.__refresh_token.create_index([("created_at", 1)], expireAfterSeconds=300)
        except Exception:
            logger.exception("Failed to create index on refresh_token.created_at")

        try:
            await self.__otp_code.create_index([("created_at", 1)], expireAfterSeconds=600)
        except Exception:
            logger.exception("Failed to create index on otp_code.created_at")

    @safe_db_operation
    async def save_user(self, **kwargs):
        """ a method to save the user into the database
        Args:
            kwargs (dict): the arguments of the class to save

        return the saved user
        """
        result = await self.__user.insert_one(kwargs)
        user_id = result.inserted_id
        return function_response(True, {"user_id": user_id})

    @safe_db_operation
    async def create_buyer_profile(self, user_id: str | ObjectId, initial_data: Dict | None = None):
        """Create a buyer profile/document linked to the user.

        Args:
            user_id: ObjectId or string of the user id
            initial_data: optional initial payload for buyer profile
        """

        doc = {
            "user_id": ObjectId(user_id) if isinstance(user_id, str) else user_id,
            "created_at": datetime.now(),
        }
        if isinstance(initial_data, dict):
            doc.update(initial_data)

        res = await self.__buyer.insert_one(doc)
        if res.acknowledged:
            return function_response(True, {"buyer_id": res.inserted_id})
        return function_response(False)

    @safe_db_operation
    async def create_seller_profile(self, user_id: str | ObjectId, initial_data: Dict | None = None):
        """Create a seller profile/document linked to the user.

        Args:
            user_id: ObjectId or string of the user id
            initial_data: optional initial payload for seller profile
        """
        sellers = self.__seller
        seller_profile = Seller(user_id=ObjectId(user_id) if isinstance(user_id, str) else user_id)
        doc = seller_profile.to_dict()
        if isinstance(initial_data, dict):
            doc.update(initial_data)

        houses_sold = int(doc.get("houses_sold") or 0)
        is_verified = bool(doc.get("is_verified"))
        doc["houses_sold"] = houses_sold
        doc["is_verified"] = is_verified
        doc["level"] = await self.get_seller_level(is_verified=is_verified, houses_sold=houses_sold)

        res = await sellers.insert_one(doc)
        if res.acknowledged:
            return function_response(True, {"seller_id": res.inserted_id})
        return function_response(False)

    @safe_db_operation
    async def get_seller_by_user_id(self, user_id: str):
        """Get a seller profile document by its linked user id."""
        seller = await self.__seller.find_one({"user_id": ObjectId(user_id)})
        if not seller:
            return function_response(False)
        return function_response(True, seller)

    @safe_db_operation
    async def get_buyer_by_user_id(self, user_id: str):
        """Get a buyer profile document by its linked user id."""
        buyer = await self.__buyer.find_one({"user_id": ObjectId(user_id)})
        if not buyer:
            return function_response(False)
        return function_response(True, buyer)

    @safe_db_operation
    async def create_listing_submission(self, listing_document: Dict):
        """Persist a seller listing submission in the listings collection.
        Args:
            listing_document: the document of the listing to be created
        """

        result = await self.__listings.insert_one(listing_document)
        if result.acknowledged:
            return function_response(True, {"listing_id": result.inserted_id})
        return function_response(False)
    
    @safe_db_operation
    async def save_listing_media(self, listing_id: str, media_name: str, data: Dict):
        """ a method to save the provided media for a listing along with the ai detector scan data
        Args:
            listing_id: the _id of the listing to be updated
            media_name: the name of the media to be saved this would also be the key of the media in the database
            data: a dictionary containing the image key, the type of file in the key and the result of the ai scan
        """

        # check if the provided image belongs to the verification list so that verification images are saved differently
        if media_name in [
            "tax_clearance_certificate",
            "structural_integrity_report", "occupancy_permit",
            "proof_of_ownership"
        ] or media_name.startswith("estate_dues"):
            await self.__listings.update_one({"_id": ObjectId(listing_id)}, {
                "$push": {
                    "verification_media": {media_name: data}
                }
            })
        else:
            await self.__listings.update_one({"_id": ObjectId(listing_id)}, {
                "$push": {
                    "listing_media": {media_name: data}
                }
            })

    @safe_db_operation
    async def update_listing_by_id(self, listing_id: str, **kwargs):
        """Update a listing document by its ObjectId string.

        kwargs will be applied with a $set operation. Returns a
        FunctionResponse indicating success or failure.
        """
        listings = self.__db["listings"]
        try:
            oid = ObjectId(listing_id) if isinstance(listing_id, str) and ObjectId.is_valid(listing_id) else listing_id
        except Exception:
            oid = listing_id

        result = await listings.update_one({"_id": oid}, {"$set": kwargs})
        if not result.acknowledged:
            return function_response(False)
        return function_response(True)

    @safe_db_operation
    async def get_seller_listings(self, seller_id: str, page: int):
        """Fetch all listings for a seller.
        
        Args:
            seller_id: The seller's user ID
            page: the page number to use in getting a paginated list of listings
        Returns:
            List of listing documents with media metadata
        """

        from services.s3_uploader import uploader

        listings = self.__db["listings"]
        # Match seller_id as string or ObjectId
        query = {"seller_id": ObjectId(seller_id)}
        results = await listings.find(query, {"_id": 1, "property_type": 1, "price": 1, "description": 1, "listing_media": 1, "status": 1}).skip((page - 1) * 10).limit(10).to_list()
        if results:
            for listing in results:
                # get a preview url to use to preview the house in the frontend dashboard
                preview_key = None
                # pick the exterior image or land image for each listing
                if listing["property_type"] == "shop":
                    for media_dict in listing["listing_media"]:
                        if media_dict.get("shop_exterior", None):
                            preview_key = media_dict.get("shop_exterior", {}).get("key", None)
                elif listing["property_type"] == "land":
                    for media_dict in listing["listing_media"]:
                        if media_dict.get("land_image", None):
                            preview_key = media_dict.get("land_image", {}).get("key", None)
                else:
                    for media_dict in listing["listing_media"]:
                        if media_dict.get("exterior", None):
                            preview_key = media_dict.get("exterior", {}).get("key", None)
                listing["preview_url"] = uploader.create_url(preview_key)
                del listing["listing_media"]
            return function_response(True, results)
        return function_response(True, [])
    
    async def save_buyer_listing_recommendation(self, user_id: str, buyer_dict: Dict):
        """ a method to add a buyers recommended listings settings to the database
        Args:
            user_id: the user id of the buyer
            buyer_dict: the dictionary containg the buyer information
        """

        # ensure that the user id provided is available in the user table
        if await self.__user.count_documents({"_id": ObjectId(user_id)}) != 1 or await self.__buyer.count_documents({"user_id": ObjectId(user_id)}) > 0:
            return function_response(False)
        buyer_dict["user_id"] = ObjectId(user_id)
        await self.__buyer.insert_one(buyer_dict)
        return function_response(True)

    async def update_buyer_listing_recommendation(self, buyer_id: str,  buyer_dict: Dict):
        """ a method to update the buyer listings recommendation
        Args:
            buyer_dict: the items to update
        """

        if not buyer_dict or buyer_dict == {}:
            return function_response(True)
        amenities = buyer_dict.get("amenities", None)
        if amenities:
            del buyer_dict["amenities"]
            for amenity in amenities:
                await self.__buyer.update_one({"_id": ObjectId(buyer_id)}, {"$push": {"amenities": amenity}})
        await self.__buyer.update_one({"_id": ObjectId(buyer_id)}, {"$set": buyer_dict})
        return function_response(True)

    async def get_buyer_recommendation_settings(self, user_id: str):
        """ a method to get the recommended listings settinbgs for a buyer
        Args:
            user_id: the user id of the settings
        """

        settings = await self.__buyer.find_one({"user_id": user_id}, {"user_id": 0})
        return function_response(True, settings) if settings else function_response(False)
    
    @safe_db_operation
    async def get_recommended_listings(self, buyer_recommendation_settings: Dict) -> List[Any]:
        """Return latest listings for recommendations."""

        # use the dictionary provided to get listings which suit the buyers settings
        print(buyer_recommendation_settings)
        return

        skip = max(0, (int(page) - 1)) * int(per_page)
        seller = await self.__seller.find_one({"user_id": ObjectId(user_id)}, {"_id": 1})
        seller_id = seller.get("_id", "")

        # get all listing not made by the current user
        total = await self.__listings.count_documents({"seller_id": {"$ne": seller_id}})
        cursor = self.__listings.find({"seller_id": {"$ne": seller_id}}, {}).sort("created_at", -1).skip(skip).limit(int(per_page))
        results = await cursor.to_list(length=int(per_page))
        return function_response(True, {"results": results, "total": total})

    @safe_db_operation
    async def search_seller_listings(self, seller_id: str, query_text: str):
        """Search listings for a seller by title, description, or location."""
        listings = self.__db["listings"]
        text_filters = [
            {"title": {"$regex": query_text, "$options": "i"}},
            {"description": {"$regex": query_text, "$options": "i"}},
            {"location": {"$regex": query_text, "$options": "i"}},
        ]

        identity_filters = [{"seller_id": seller_id}, {"user_id": seller_id}]
        try:
            identity_filters.extend(
                [{"seller_id": ObjectId(seller_id)}, {"user_id": ObjectId(seller_id)}]
            )
        except Exception:
            pass

        search_filter = {"$and": [{"$or": text_filters}, {"$or": identity_filters}]}
        results = await listings.find(search_filter).limit(20).to_list(length=20)
        if results:
            return function_response(True, results)
        return function_response(True, [])

    @safe_db_operation
    async def get_listings_by_location(self, location: str, page: int = 1, per_page: int = 10):
        """Search and return paginated listings matching a location string.

        Args:
            location: Partial or full location text to match (case-insensitive).
            page: 1-based page number.
            per_page: number of items per page.
        Returns:
            FunctionResponse with payload: {"results": [...], "total": <int>}.
        """
        listings = self.__db["listings"]
        query_filter = {"location": {"$regex": location, "$options": "i"}, "status": "approved"}

        total = await listings.count_documents(query_filter)
        skip = max(0, (int(page) - 1)) * int(per_page)
        cursor = listings.find(query_filter, {"_id": 1, "title": 1, "description": 1, "location": 1, "media": 1}).sort("created_at", -1).skip(skip).limit(int(per_page))
        results = await cursor.to_list(length=int(per_page))

        for result in results:
            exterior_data = result.get("media", {}).get("exterior_images", [])
            del result["media"]
            result["exterior_images"] = exterior_data

        return function_response(True, {"results": results, "total": total})

    @safe_db_operation
    async def get_rental_listings(self, page: int = 1, per_page: int = 10):
        """Return paginated listings that are rentals and not sold.

        The filter attempts to match common rental indicators such as a
        `category` containing "rent"/"rental", a `rent` field, or text
        mentions in `title`/`description`. It also excludes listings marked
        as sold.
        """
        listings = self.__db["listings"]

        rental_filters = [
            {"category": {"$regex": "rent", "$options": "i"}},
            {"category": {"$regex": "rental", "$options": "i"}},
            {"title": {"$regex": "rent", "$options": "i"}},
            {"description": {"$regex": "rent", "$options": "i"}},
            {"rent": {"$exists": True}},
        ]

        not_sold_filter = {
            "$or": [
                {"is_sold": False},
                {"is_sold": {"$exists": False}},
                {"status": {"$nin": ["sold", "completed", "closed"]}},
            ]
        }

        query_filter = {"$and": [{"$or": rental_filters}, not_sold_filter]}

        total = await listings.count_documents(query_filter)
        skip = max(0, (int(page) - 1)) * int(per_page)
        cursor = listings.find(query_filter).sort("created_at", -1).skip(skip).limit(int(per_page))
        results = await cursor.to_list(length=int(per_page))

        return function_response(True, {"results": results, "total": total})

    @safe_db_operation
    async def get_inspections_by_requester(self, requester_id: str):
        """Return inspection requests made by a buyer (requester)."""
        inspections = self.__db["inspections"]
        query = {"requester_id": requester_id}
        results = await inspections.find(query).sort("created_at", -1).to_list(length=100)
        if results:
            return function_response(True, results)
        return function_response(True, [])

    @safe_db_operation
    async def get_listing_by_id(self, listing_id: str):
        """Fetch a specific listing by its ID.
        
        Args:
            listing_id: The listing's ObjectId as string
            
        Returns:
            The listing document with full media metadata
        """

        from services.s3_uploader import uploader

        listing = await self.__listings.find_one({"_id": ObjectId(listing_id)}, {"verification_media": 0})
        if listing:
            for media in listing["listing_media"]:
                for key, value in media.items():
                    image_key = value.get("key")
                    media[key] = uploader.create_url(image_key)
            return function_response(True, listing)
        return function_response(False)

    @safe_db_operation
    async def get_seller_dashboard_stats(self, user_id: str):
        """Return seller dashboard counts from listings/messages/inspections/deals data."""

        listings_col = self.__db["listings"]
        messages_col = self.__db["messages"]
        inspections_col = self.__db["inspections"]
        deals_col = self.__db["deals"]

        # listings uploaded by this seller
        active_listings = await listings_col.count_documents({"$or": user_id})

        # buyers with pending messages to answer
        pending_message_filter = {
            "$and": [
                {"$or": user_id},
                {
                    "$or": [
                        {"status": {"$in": ["pending", "unread", "open"]}},
                        {"is_read": False},
                        {"seller_replied": False},
                        {"reply_pending": True},
                    ]
                },
            ]
        }

        pending_messages = await messages_col.find(
            pending_message_filter, {"buyer_id": 1, "sender_id": 1}
        ).to_list(length=1000)
        buyer_ids = set()
        for msg in pending_messages:
            if msg.get("buyer_id"):
                buyer_ids.add(str(msg.get("buyer_id")))
            elif msg.get("sender_id"):
                buyer_ids.add(str(msg.get("sender_id")))
        pending_enquiries = len(buyer_ids) if buyer_ids else len(pending_messages)

        # inspections to be attended by this seller
        scheduled_inspections = await inspections_col.count_documents(
            {
                "$and": [
                    {"$or": user_id},
                    {"status": {"$in": ["scheduled", "pending", "upcoming"]}},
                ]
            }
        )

        # verified deals / successfully sold items
        sold_from_listings = await listings_col.count_documents(
            {
                "$and": [
                    {"$or": user_id},
                    {
                        "$or": [
                            {"status": {"$in": ["sold", "completed", "closed"]}},
                            {"is_sold": True},
                        ]
                    },
                ]
            }
        )
        sold_from_deals = await deals_col.count_documents(
            {
                "$and": [
                    {"$or": user_id},
                    {"status": {"$in": ["verified", "completed", "closed", "successful"]}},
                ]
            }
        )
        verified_deals = max(sold_from_listings, sold_from_deals)

        return function_response(
            True,
            {
                "active_listings": active_listings,
                "pending_enquiries": pending_enquiries,
                "scheduled_inspections": scheduled_inspections,
                "verified_deals": verified_deals,
            },
        )

    @safe_db_operation
    async def get_admin_dashboard_stats(self):
        """Return platform-wide counts for the admin dashboard."""

        disputes_col = self.__db["disputes"]
        support_tickets = await disputes_col.count_documents({})

        return function_response(
            True,
            {
                "total_users": await self.__user.count_documents({}),
                "email_non_verified_users": await self.__user.count_documents({"is_verified": False}),
                "total_properties": await self.__listings.count_documents({}),
                "approved_property_listings": await self.__listings.count_documents({"status": "approved"}),
                "pending_property_listings": await self.__listings.count_documents({"status": "pending_approval"}),
                "sold_property_listing": await self.__listings.count_documents({"status": "sold"}),
                "total_sellers": await self.__user.count_documents({"role": {"$in": ["sellers", "both"]}}),
                "total_buyers": await self.__user.count_documents({"role": {"$in": ["buyers", "both"]}}),
                "support_tickets": support_tickets,
            },
        )

    @safe_db_operation
    async def get_admin_users(self, page: int = 1, filter_query: dict | None = None):
        """Return a paginated list of users for the admin area."""

        skip = (page - 1) * 10
        query = filter_query or {}

        users = await self.__user.find(query, {"password": 0, "created_at": 0}).sort("created_at", -1).skip(skip).limit(10).to_list()

        return function_response(True, users)

    @safe_db_operation
    async def get_admin_user_by_id(self, user_id: str):
        """Return one sanitized user document for the admin area."""

        from services.s3_uploader import uploader

        user = await self.__user.find_one({"_id": ObjectId(user_id)}, {"password": 0, "created_at": 0})
        if not user:
            return function_response(False)

        if user.get("image_key"):
            user["image_url"] = await uploader.create_url(user.get("image_key"))
        return function_response(True, user)

    @safe_db_operation
    async def get_admin_pending_listings(self, page: int = 1, per_page: int = 20):
        """Return paginated listings awaiting admin approval."""

        page = max(int(page or 1), 1)
        per_page = min(max(int(per_page or 20), 1), 100)
        skip = (page - 1) * per_page
        query = {"status": "pending_approval"}
        listings = self.__db["listings"]

        total = await listings.count_documents(query)
        cursor = listings.find(query).sort("created_at", -1).skip(skip).limit(per_page)
        results = cursor.to_list()

        return function_response(
            True,
            {
                "properties": results,
                "meta": {
                    "page": page,
                    "per_page": per_page,
                    "total": total,
                    "total_pages": (total + per_page - 1) // per_page if total else 0,
                },
            },
        )

    @safe_db_operation
    async def get_admin_listing_by_id(self, listing_id: str):
        """Return a single listing for admin review."""

        if not ObjectId.is_valid(listing_id):
            return function_response(False)

        listing = await self.__db["listings"].find_one({"_id": ObjectId(listing_id)})
        if not listing:
            return function_response(False)

        return function_response(True,listing)

    @safe_db_operation
    async def update_admin_listing_status(self, listing_id: str, status: str, admin_id: str | None = None):
        """Approve or decline a listing from the admin review flow."""

        if status not in {"approved", "declined"} or not ObjectId.is_valid(listing_id):
            return function_response(False)

        listings = self.__db["listings"]
        update_data = {
            "status": status,
            "reviewed_at": datetime.now(),
        }

        if admin_id:
            update_data["reviewed_by"] = str(admin_id)

        result = await listings.update_one({"_id": ObjectId(listing_id)}, {"$set": update_data})
        if not result.acknowledged:
            return function_response(False)

        listing = await listings.find_one({"_id": ObjectId(listing_id)})
        if not listing:
            return function_response(False)

        return function_response(True, listing)
    
    @safe_db_operation
    async def get_admin_by_email(self, email: str, password: str):
        """Get an admin document by email, optionally verifying password."""

        admin = await self.__admin.find_one({"email": email})
        if not admin:
            return function_response(False)


        stored_password = admin.get("password")
        if not stored_password:
            return function_response(False)

        try:
            ph.verify(stored_password, password)
            return function_response(True, admin)
        except VerifyMismatchError:
            return function_response(False)

    @safe_db_operation
    async def get_admin_by_id(self, admin_id: str):
        """Get an admin document by its id from the admins collection."""
        admin = await self.__admin.find_one({"_id": ObjectId(admin_id)})
        if not admin:
            return function_response(False)

        del admin["password"]
        return function_response(True, admin)
    
    @safe_db_operation
    async def get_user_by_email(self, email: str, password: str|None = None):
        """ a method to get the user from the database using the user email address
        Args:
            email (str): the email address of the user to get from the database
        return a response with the user if a user is found
        """

        user = await self.__user.find_one({"email": email})
        if not user:
            return function_response(False)

        # If no password provided, return the user record for OTP flow
        if password is None:
            return function_response(True, user)

        # If user has no password set, password login is not possible
        stored_password = user.get("password")
        if not stored_password:
            return function_response(False)

        # verify that the password passed is the correct one
        try:
            ph.verify(stored_password, password)
            return function_response(True, user)
        except VerifyMismatchError:
            return function_response(False)

    @safe_db_operation
    async def find_user_by_email(self, email: str):
        """ a method to find a user by email without verifying password
        Returns a FunctionResponse with payload as the user dict if found
        """

        from services.s3_uploader import uploader

        user = await self.__user.find_one({"email": email})
        if not user:
            return function_response(False)
        # do not expose password
        user.pop("password", None)
        if user.get("image_url"):
            user["image_url"] = await uploader.resolve_accessible_s3_url(user.get("image_url"), user.get("image_key"))
        return function_response(True, user)

    @safe_db_operation
    async def get_user_by_id(self, user_id: str):
        """ a method to get the user by the user id
        Args:
            user_id (str): the user id to use in location a user
        Returns a response containing the user
        """

        user = await self.__user.find_one({"_id": ObjectId(user_id)})

        if not user:
            return function_response(False)
        del user["password"]
        return function_response(True, user)
        
    @safe_db_operation
    async def update_user_by_id(self, user_id: str, **kwargs):
        """ a method to update the given user by the provided user id
        Args:
            user_id (str): the user id to be affected
            kwargs: the arguments to be updated on the document
        """

        update_result = await self.__user.update_one({"_id": ObjectId(user_id)}, {"$set": kwargs})
        if not update_result.acknowledged:
            return function_response(False)
        return function_response(True) # change this to return the data gotten from the database
        
    @safe_db_operation
    async def update_password(self, user_id: str, old_password: str, new_password: str):
        """ a method to update the user password to a new one
        Args:
            user_id: the user id of the user
            old_password: the old password of the user
            new_password: the password to change to
        """

        user = await self.__user.find_one({"_id": ObjectId(user_id)})
        if not user:
            return function_response(False)

        try:
            ph.verify(user.get("password"), old_password)
        except VerifyMismatchError:
            return function_response(False)
        
        await self.__user.update_one({"_id": ObjectId(user_id)}, {"$set": {"password": ph.hash(new_password)}})
        return function_response(True)

    @safe_db_operation
    async def delete_user(self, user_id: str):
        """ a methodn to delete a  user from the database
        Args:
            user_id (str): a string containing the user id to be deleted
        """
        await self.__user.delete_many({"_id": ObjectId(user_id)})

    @safe_db_operation
    async def save_refresh_token(self, refresh_token_object: Dict):
        """ a method to save the refresh token and the email to the database
        Args:
            token (str): the token to be saved
            user_id (str): the user_id associated with the token
        """

        # delete any saved refresh token of the user
        await self.delete_refresh_token(refresh_token_object.get("user_id"))

        refresh_token = await self.__refresh_token.insert_one(refresh_token_object)
        if refresh_token.acknowledged:
            return function_response(True)
        return function_response(False)
    
    @safe_db_operation
    async def delete_refresh_token(self, user_id):
        """ a method to delete the refresh token associated with the email
        Args:
            email (str): the email or the associated refresh token
        """
        await self.__refresh_token.delete_many({"user_id": user_id})

    @safe_db_operation
    async def delete_refresh_token_by_token(self, token: str):
        """Delete a refresh token document by its token string."""
        await self.__refresh_token.delete_many({"token": token})

    @safe_db_operation
    async def get_refresh_token(self, refresh_token: str):
        """ a method to verify the refresh token
        Args:
            token (str): the refresh_token
        Return the user_id associated with the refresh token if found
        """

        refresh_dict = await self.__refresh_token.find_one({"token": refresh_token})
        if not refresh_dict:
            return function_response(False)
        # delete the token to enforce single-use refresh tokens
        await self.delete_refresh_token_by_token(refresh_token)

        return function_response(True, {"user_id": refresh_dict.get("user_id")})
    
    @safe_db_operation
    async def save_otp_code(self, otp_dict: Dict):
        """ a method to save the provided otp code for each user
        Args:
            email (str): the email address to save the otp code in
            otp_code (str): the code to save
        Return a bool for successful save or not
        """

        previous_otp_dict = await self.__otp_code.find_one({"email": otp_dict.get("email")})

        if previous_otp_dict:
            if previous_otp_dict.get("count") == 3:
                # the required request for otp validation is passed the user should wait for 10 minuites before requesting again

                return function_response(False)

            result = await self.__otp_code.update_one(
                {"email": otp_dict.get("email")},
                {"$set": {"code": otp_dict.get("code"), "count": previous_otp_dict.get("count") + 1}}
            )
        else:
            result = await self.__otp_code.insert_one(otp_dict)
        return function_response(True)
    
    @safe_db_operation
    async def get_code_email(self, code: str):
        """ a method to get the email address associated with a code
        Args:
            code (str): the otp code of the user
        Return the email address upon successful retrival
        """

        otp_dict = await self.__otp_code.find_one({"code": code})
        if otp_dict:
            await self.delete_otp_code(otp_dict.get("email"))
            return function_response(True, otp_dict)
        return function_response(False)
    
    @safe_db_operation
    async def delete_otp_code(self, email: str):
        """ a method to delete the otp code of the user
        Args:
            email (str): the token to be deleted from the database
        """

        await self.__otp_code.delete_many({"email": email})

    @safe_db_operation
    async def save_message(self, message_data: dict):
        """Save a message to the messages collection.
        
        Args:
            message_data: Dictionary containing sender_id, receiver_id, listing_id, message_text, etc.
            
        Returns:
            Response with message_id on success
        """
        messages = self.__db["messages"]
        message_data["created_at"] = datetime.now()
        message_data["read"] = False
        result = await messages.insert_one(message_data)
        if result.acknowledged:
            return function_response(True, {"message_id": str(result.inserted_id)})
        return function_response(False)

    @safe_db_operation
    async def get_seller_conversations(self, seller_id: str):
        """Get all unique conversations (with unique buyers) for a seller.
        
        Args:
            seller_id: The seller's user ID
            
        Returns:
            List of conversations with latest message preview
        """
        messages = self.__db["messages"]
        
        # Find all messages where seller is the receiver
        pipeline = [
            {
                "$match": {
                    "$or": [
                        {"receiver_id": seller_id},
                        {"receiver_id": ObjectId(seller_id) if ObjectId.is_valid(seller_id) else seller_id}
                    ]
                }
            },
            {
                "$sort": {"created_at": -1}
            },
            {
                "$group": {
                    "_id": {
                        "seller_id": "$receiver_id",
                        "buyer_id": "$sender_id",
                        "listing_id": "$listing_id"
                    },
                    "last_message": {"$first": "$message_text"},
                    "last_message_at": {"$first": "$created_at"},
                    "unread_count": {
                        "$sum": {
                            "$cond": [{"$eq": ["$read", False]}, 1, 0]
                        }
                    },
                    "sender_name": {"$first": "$sender_name"},
                    "listing_title": {"$first": "$listing_title"},
                }
            },
            {
                "$sort": {"last_message_at": -1}
            }
        ]
        
        results = await messages.aggregate(pipeline).to_list(length=1000)
        if results:
            return function_response(True, results)
        return function_response(True, [])

    @safe_db_operation
    async def get_conversation_messages(self, seller_id: str, buyer_id: str, listing_id: str):
        """Get all messages in a conversation between a seller and buyer for a listing.
        
        Args:
            seller_id: The seller's user ID
            buyer_id: The buyer's user ID
            listing_id: The listing ID
            
        Returns:
            List of messages in the conversation thread
        """
        messages = self.__db["messages"]
        
        # Find all messages between these two users for this listing
        query = {
            "listing_id": listing_id,
            "$or": [
                {
                    "$and": [
                        {"sender_id": buyer_id},
                        {"receiver_id": seller_id}
                    ]
                },
                {
                    "$and": [
                        {"sender_id": seller_id},
                        {"receiver_id": buyer_id}
                    ]
                }
            ]
        }
        
        # Also try with ObjectId
        try:
            seller_oid = ObjectId(seller_id) if ObjectId.is_valid(seller_id) else seller_id
            buyer_oid = ObjectId(buyer_id) if ObjectId.is_valid(buyer_id) else buyer_id
            query = {
                "listing_id": listing_id,
                "$or": [
                    {
                        "$and": [
                            {"sender_id": {"$in": [buyer_id, buyer_oid]}},
                            {"receiver_id": {"$in": [seller_id, seller_oid]}}
                        ]
                    },
                    {
                        "$and": [
                            {"sender_id": {"$in": [seller_id, seller_oid]}},
                            {"receiver_id": {"$in": [buyer_id, buyer_oid]}}
                        ]
                    }
                ]
            }
        except Exception:
            pass
        
        results = await messages.find(query).sort("created_at", 1).to_list(length=1000)
        
        # Mark messages as read for the seller
        await messages.update_many(
            {
                "$and": [
                    {"receiver_id": seller_id},
                    {"sender_id": buyer_id},
                    {"listing_id": listing_id}
                ]
            },
            {"$set": {"read": True}}
        )
        
        if results:
            return function_response(True, results)
        return function_response(True, [])

    @safe_db_operation
    async def get_buyer_conversations(self, buyer_id: str):
        """Get all unique conversations (with unique sellers) for a buyer.
        
        Args:
            buyer_id: The buyer's user ID
            
        Returns:
            List of conversations with latest message preview
        """
        messages = self.__db["messages"]
        
        # Find all messages where buyer is the receiver
        pipeline = [
            {
                "$match": {
                    "$or": [
                        {"receiver_id": buyer_id},
                        {"receiver_id": ObjectId(buyer_id) if ObjectId.is_valid(buyer_id) else buyer_id}
                    ]
                }
            },
            {
                "$sort": {"created_at": -1}
            },
            {
                "$group": {
                    "_id": {
                        "buyer_id": "$receiver_id",
                        "seller_id": "$sender_id",
                        "listing_id": "$listing_id"
                    },
                    "last_message": {"$first": "$message_text"},
                    "last_message_at": {"$first": "$created_at"},
                    "unread_count": {
                        "$sum": {
                            "$cond": [{"$eq": ["$read", False]}, 1, 0]
                        }
                    },
                    "sender_name": {"$first": "$sender_name"},
                    "listing_title": {"$first": "$listing_title"},
                }
            },
            {
                "$sort": {"last_message_at": -1}
            }
        ]
        
        results = await messages.aggregate(pipeline).to_list(length=1000)
        if results:
            return function_response(True, results)
        return function_response(True, [])

    @safe_db_operation
    async def mark_messages_as_read(self, receiver_id: str, sender_id: str, listing_id: str = None):
        """Mark all messages from a sender to a receiver as read.
        
        Args:
            receiver_id: The receiver's user ID
            sender_id: The sender's user ID
            listing_id: Optional listing ID to filter by
            
        Returns:
            Response with count of updated messages
        """
        messages = self.__db["messages"]
        
        query = {
            "receiver_id": receiver_id,
            "sender_id": sender_id,
            "read": False
        }
        
        if listing_id:
            query["listing_id"] = listing_id
        
        result = await messages.update_many(query, {"$set": {"read": True}})
        
        return function_response(True, {"updated_count": result.modified_count})

    @safe_db_operation
    async def get_unread_message_count(self, receiver_id: str):
        """Get count of unread messages for a user.
        
        Args:
            receiver_id: The receiver's user ID
            
        Returns:
            Count of unread messages
        """
        messages = self.__db["messages"]
        
        count = await messages.count_documents({
            "receiver_id": receiver_id,
            "read": False
        })
        
        return function_response(True, {"unread_count": count})
    
storage = DBStorage()
    
