from functools import lru_cache
from typing import Any, Dict, Optional, Set

import requests
from fastapi import Depends, HTTPException, Request, status
from jose import JWTError, jwt
from pydantic import BaseModel

from app.core.config import settings


class AuthenticatedUser(BaseModel):
    """Normalized authenticated user extracted from a verified Clerk token."""

    user_id: str
    email: Optional[str] = None
    role: Optional[str] = None
    claims: Dict[str, Any]


def _unauthorized(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail)


def _forbidden(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=detail)


def _parse_admin_emails(csv_value: str) -> Set[str]:
    return {email.strip().lower() for email in csv_value.split(",") if email.strip()}


@lru_cache(maxsize=1)
def _get_jwks() -> Dict[str, Any]:
    if not settings.clerk_jwks_url:
        raise RuntimeError("CLERK_JWKS_URL is not configured")

    response = requests.get(settings.clerk_jwks_url, timeout=5)
    response.raise_for_status()
    jwks = response.json()

    if not isinstance(jwks, dict) or "keys" not in jwks:
        raise RuntimeError("Invalid JWKS response from Clerk")

    return jwks


def _find_signing_key(token: str) -> Dict[str, Any]:
    try:
        header = jwt.get_unverified_header(token)
    except JWTError as exc:
        raise _unauthorized("Invalid token header") from exc

    kid = header.get("kid")
    if not kid:
        raise _unauthorized("Missing key id in token")

    try:
        keys = _get_jwks().get("keys", [])
    except Exception as exc:
        raise _unauthorized("Unable to load Clerk JWKS") from exc

    for key in keys:
        if key.get("kid") == kid:
            return key

    raise _unauthorized("No matching signing key")


def verify_token(request: Request) -> Dict[str, Any]:
    auth_header = request.headers.get("Authorization")

    if not auth_header or not auth_header.startswith("Bearer "):
        raise _unauthorized("Missing token")

    token = auth_header.split(" ", 1)[1].strip()
    if not token:
        raise _unauthorized("Missing token")

    key = _find_signing_key(token)

    decode_kwargs: Dict[str, Any] = {
        "algorithms": ["RS256"],
        "options": {"verify_aud": bool(settings.clerk_jwt_audience)},
    }

    if settings.clerk_jwt_issuer:
        decode_kwargs["issuer"] = settings.clerk_jwt_issuer

    if settings.clerk_jwt_audience:
        decode_kwargs["audience"] = settings.clerk_jwt_audience

    try:
        return jwt.decode(token, key, **decode_kwargs)
    except JWTError as exc:
        raise _unauthorized("Invalid token") from exc


def get_current_user(payload: Dict[str, Any] = Depends(verify_token)) -> AuthenticatedUser:
    subject = payload.get("sub")
    if not subject:
        raise _unauthorized("Invalid token payload")

    email = payload.get("email")
    role = payload.get("role") or payload.get("org_role")

    return AuthenticatedUser(
        user_id=subject,
        email=email,
        role=role,
        claims=payload,
    )


def require_admin(user: AuthenticatedUser = Depends(get_current_user)) -> AuthenticatedUser:
    admin_emails = _parse_admin_emails(settings.admin_emails_csv)
    user_email = (user.email or "").lower()

    if user.role == "admin" or (user_email and user_email in admin_emails):
        return user

    raise _forbidden("Forbidden")