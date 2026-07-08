"""Centralized environment settings for backend configuration.

This module validates critical secrets at import time and fails fast with a
clear error if required variables are missing. Non-critical configuration
issues are logged as warnings.
"""

from functools import cached_property
from os import getenv
import logging

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("home_buddy.settings")


class Settings:
    """Read and expose backend environment variables in one place.

    The `validate()` method checks for required secrets and raises a
    RuntimeError listing missing variables so the application fails fast in
    production if misconfigured.
    """

    REQUIRED_VARS = ("JWT_ACCESS_KEY", "JWT_REFRESH_KEY")

    def get(self, key: str, default: str | None = None) -> str | None:
        return getenv(key, default)

    def validate(self) -> None:
        """Ensure all required environment variables are present.

        Raises:
            RuntimeError: if any required environment variables are missing.
        """
        missing = [v for v in self.REQUIRED_VARS if not self.get(v)]
        if missing:
            msg = (
                "Missing required environment variables: " + ", ".join(missing)
            )
            # Log the error before raising so external log collectors capture it
            logger.critical(msg)
            raise RuntimeError(msg)

    @cached_property
    def backend_port(self) -> int:
        return int(self.get("BACKEND_PORT", "8000"))

    @cached_property
    def jwt_access_key(self) -> str | None:
        return self.get("JWT_ACCESS_KEY")

    @cached_property
    def jwt_refresh_key(self) -> str | None:
        return self.get("JWT_REFRESH_KEY")

    @cached_property
    def mongo_uri(self) -> str | None:
        return self.get("MONGO_URI")

    @cached_property
    def google_account(self) -> str | None:
        return self.get("GOOGLE_ACCOUNT")

    @cached_property
    def google_password(self) -> str | None:
        return self.get("GOOGLE_PASSWORD")

    @cached_property
    def google_address(self) -> str | None:
        return self.get("GOOGLE_ADDRESS")

    @cached_property
    def google_client_id(self) -> str | None:
        return self.get("GOOGLE_CLIENT_ID")

    @cached_property
    def frontend_url(self) -> str:
        return self.get("FRONTEND_URL", "http://localhost:3000")

    @cached_property
    def aws_s3_bucket(self) -> str | None:
        return self.get("AWS_S3_BUCKET") or self.get("AWS_BUCKET_NAME")

    @cached_property
    def aws_region(self) -> str:
        return self.get("AWS_REGION") or self.get("AWS_DEFAULT_REGION") or "us-east-1"

    @cached_property
    def aws_access_key_id(self) -> str | None:
        return self.get("AWS_ACCESS_KEY_ID")

    @cached_property
    def aws_secret_access_key(self) -> str | None:
        return self.get("AWS_SECRET_ACCESS_KEY")

    @cached_property
    def sightengine_api_user(self) -> str | None:
        return self.get("SIGHTENGINE_API_USER")

    @cached_property
    def sightengine_api_secret(self) -> str | None:
        return self.get("SIGHTENGINE_API_SECRET")


settings = Settings()

# Validate critical configuration at import time so the process fails fast
# if required secrets are not present. This avoids silent runtime failures
# later when components attempt to use missing secrets.
try:
    settings.validate()
except Exception:
    # Re-raise so importing the package fails and the runtime won't start.
    raise
