import uuid
import random
import string
from datetime import datetime, timezone


def generate_pass_id() -> str:
    """Generate a human-readable pass ID like VISIT-2026-000123."""
    year = datetime.now(timezone.utc).year
    suffix = random.randint(100000, 999999)
    return f"VISIT-{year}-{suffix}"


def generate_uuid() -> str:
    return str(uuid.uuid4())


def utc_now() -> datetime:
    return datetime.now(timezone.utc)
