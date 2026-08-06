from pydantic import BaseModel, Field, field_validator
from typing import List
import base64


def clean_base64(value: str) -> str:
    """
    Removes data:image/... prefix and validates base64.
    """

    if "," in value:
        value = value.split(",", 1)[1]

    try:
        base64.b64decode(value, validate=True)
    except Exception:
        raise ValueError("Invalid base64 image")

    return value


class EnrollRequest(BaseModel):
    image_base64: str = Field(
        ...,
        min_length=20,
        description="Base64 encoded face image",
    )

    @field_validator("image_base64")
    @classmethod
    def validate_image(cls, value):
        return clean_base64(value)


class VerifyRequest(BaseModel):
    image_base64: str = Field(
        ...,
        min_length=20,
        description="Base64 encoded face image",
    )

    @field_validator("image_base64")
    @classmethod
    def validate_image(cls, value):
        return clean_base64(value)


class VerifyLiveRequest(BaseModel):
    frames: List[str] = Field(
        ...,
        min_length=5,
        max_length=15,
        description="Burst of captured frames",
    )

    @field_validator("frames")
    @classmethod
    def validate_frames(cls, frames):

        cleaned = []

        for frame in frames:
            cleaned.append(clean_base64(frame))

        return cleaned