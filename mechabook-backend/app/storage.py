import os
import uuid

from dotenv import load_dotenv

from supabase import (
    Client,
    create_client,
)


load_dotenv()


SUPABASE_URL = os.getenv(
    "SUPABASE_URL"
)


SUPABASE_SERVICE_KEY = os.getenv(
    "SUPABASE_SERVICE_KEY"
)


SUPABASE_STORAGE_BUCKET = os.getenv(
    "SUPABASE_STORAGE_BUCKET",
    "marketplace",
)


SUPABASE_MESSAGE_BUCKET = os.getenv(
    "SUPABASE_MESSAGE_BUCKET",
    "messages",
)


SUPABASE_SOUND_TEST_BUCKET = os.getenv(
    "SUPABASE_SOUND_TEST_BUCKET",
    "sound-tests",
)


if not SUPABASE_URL:
    raise RuntimeError(
        "SUPABASE_URL is missing from the backend .env file"
    )


if not SUPABASE_SERVICE_KEY:
    raise RuntimeError(
        "SUPABASE_SERVICE_KEY is missing from the backend .env file"
    )


if not (
    SUPABASE_URL.startswith(
        "https://"
    )
    or
    SUPABASE_URL.startswith(
        "http://"
    )
):
    raise RuntimeError(
        "SUPABASE_URL must start with https://"
    )


supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_SERVICE_KEY,
)


# ============================================================
# PUBLIC URL HELPER
# ============================================================

def _public_url(
    bucket: str,
    path: str,
) -> str:

    public_url = (
        supabase.storage
        .from_(bucket)
        .get_public_url(path)
    )


    if isinstance(
        public_url,
        dict
    ):
        return (
            public_url.get(
                "publicUrl"
            )
            or
            public_url.get(
                "public_url"
            )
        )


    return public_url


# ============================================================
# MARKETPLACE IMAGE
# ============================================================

def upload_marketplace_image(
    file_bytes: bytes,
    file_name: str,
    content_type: str,
) -> str:

    extension = (
        os.path.splitext(
            file_name or ""
        )[1].lower()
        or ".jpg"
    )


    unique_name = (
        f"{uuid.uuid4().hex}"
        f"{extension}"
    )


    storage_path = (
        f"listings/{unique_name}"
    )


    (
        supabase.storage
        .from_(
            SUPABASE_STORAGE_BUCKET
        )
        .upload(
            storage_path,
            file_bytes,
            {
                "content-type":
                    content_type,

                "upsert":
                    "false",
            },
        )
    )


    return _public_url(
        SUPABASE_STORAGE_BUCKET,
        storage_path,
    )


# ============================================================
# MESSAGE IMAGE
# ============================================================

def upload_message_image(
    file_bytes: bytes,
    file_name: str,
    content_type: str,
) -> str:

    extension = (
        os.path.splitext(
            file_name or ""
        )[1].lower()
        or ".jpg"
    )


    unique_name = (
        f"{uuid.uuid4().hex}"
        f"{extension}"
    )


    storage_path = (
        f"chat/{unique_name}"
    )


    (
        supabase.storage
        .from_(
            SUPABASE_MESSAGE_BUCKET
        )
        .upload(
            storage_path,
            file_bytes,
            {
                "content-type":
                    content_type,

                "upsert":
                    "false",
            },
        )
    )


    return _public_url(
        SUPABASE_MESSAGE_BUCKET,
        storage_path,
    )


# ============================================================
# SOUND TEST AUDIO
# ============================================================

def upload_sound_test_audio(
    file_bytes: bytes,
    file_name: str,
    content_type: str,
) -> str:

    extension = (
        os.path.splitext(
            file_name or ""
        )[1].lower()
        or ".mp3"
    )


    unique_name = (
        f"{uuid.uuid4().hex}"
        f"{extension}"
    )


    storage_path = (
        f"audio/{unique_name}"
    )


    (
        supabase.storage
        .from_(
            SUPABASE_SOUND_TEST_BUCKET
        )
        .upload(
            storage_path,
            file_bytes,
            {
                "content-type":
                    content_type,

                "upsert":
                    "false",
            },
        )
    )


    return _public_url(
        SUPABASE_SOUND_TEST_BUCKET,
        storage_path,
    )