from pydantic import BaseModel
from datetime import date
from typing import Optional


class SprintBase(BaseModel):
    name: str
    start_date: date
    end_date: date
    project_id: int


class SprintResponse(SprintBase):
    id: int
    risk_score: Optional[str] = None

    class Config:
        from_attributes = True