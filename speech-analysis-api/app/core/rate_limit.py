from slowapi import Limiter
from slowapi.util import get_remote_address


def user_key(request):
    """Prefer auth identity key; fallback to client IP when auth header is absent."""
    auth_header = (request.headers.get("Authorization") or "").strip()
    return auth_header or get_remote_address(request)


limiter = Limiter(key_func=user_key, default_limits=["100/hour"])