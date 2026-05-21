from fastapi import APIRouter

areas = APIRouter(prefix="/areas", tags=["areas"])


@areas.get("/{slug}", summary="Get area profile")
async def get_area(slug: str):
    return {
        "status": True,
        "message": "Area profile (placeholder)",
        "payload": {"slug": slug, "scores": {}},
    }
