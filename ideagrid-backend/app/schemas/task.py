from pydantic import BaseModel
from datetime import date
from typing import Optional

class TaskBase(BaseModel):
    title: str
    priority: str  # Low / Medium / High
    status: str    # To_Do / In_Progress / Review / Done
    deadline: date
    sprint_id: int

class TaskResponse(TaskBase):
    id: int

    class Config:
        from_attributes = True