from pydantic import BaseModel
from datetime import date
from typing import Optional, List


class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    start_date: date
    end_date: Optional[date] = None
    status: Optional[str] = "Active"

class ProjectResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    start_date: date
    end_date: Optional[date] = None
    status: str
    class Config:
        from_attributes = True


class SprintCreate(BaseModel):
    name: str
    start_date: date
    end_date: date
    project_id: int

class SprintResponse(BaseModel):
    id: int
    name: str
    start_date: date
    end_date: date
    project_id: int
    risk_score: Optional[str] = None
    class Config:
        from_attributes = True


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: Optional[str] = "Medium"
    status: Optional[str] = "To_Do"
    deadline: Optional[date] = None
    sprint_id: int
    assignee: Optional[str] = None

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    deadline: Optional[date] = None
    assignee: Optional[str] = None

class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    priority: str
    status: str
    deadline: Optional[date] = None
    sprint_id: int
    assignee: Optional[str] = None
    class Config:
        from_attributes = True


class TeamCreate(BaseModel):
    name: str
    description: Optional[str] = None

class TeamResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    name: str
    email: str
    role: Optional[str] = "Team Member"
    team_id: Optional[int] = None

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    team_id: Optional[int] = None
    class Config:
        from_attributes = True