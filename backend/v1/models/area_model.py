from pydantic import BaseModel
from typing import Dict

class AreaProfile(BaseModel):
    slug: str
    name: str | None = None
    scores: Dict[str, float] | None = {}
