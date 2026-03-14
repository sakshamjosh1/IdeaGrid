from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import Project, Sprint, Task, Team, User
from app.schemas.schemas import (
    ProjectCreate, ProjectResponse,
    SprintCreate, SprintResponse,
    TaskCreate, TaskUpdate, TaskResponse,
    TeamCreate, TeamResponse,
    UserCreate, UserResponse,
)
from app.core.risk import calculate_sprint_risk
from typing import List

router = APIRouter()


@router.get("/projects", response_model=List[ProjectResponse])
def get_projects(db: Session = Depends(get_db)):
    return db.query(Project).all()

@router.post("/projects", response_model=ProjectResponse)
def create_project(payload: ProjectCreate, db: Session = Depends(get_db)):
    project = Project(**payload.dict())
    db.add(project); db.commit(); db.refresh(project)
    return project

@router.get("/projects/{project_id}", response_model=ProjectResponse)
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project: raise HTTPException(status_code=404, detail="Not found")
    return project

@router.delete("/projects/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project: raise HTTPException(status_code=404, detail="Not found")
    db.delete(project); db.commit()
    return {"message": "Deleted"}


@router.get("/projects/{project_id}/sprints", response_model=List[SprintResponse])
def get_project_sprints(project_id: int, db: Session = Depends(get_db)):
    sprints = db.query(Sprint).filter(Sprint.project_id == project_id).all()
    result = []
    for sprint in sprints:
        tasks = db.query(Task).filter(Task.sprint_id == sprint.id).all()
        risk = calculate_sprint_risk(tasks, sprint.end_date)
        result.append(SprintResponse(
            id=sprint.id, name=sprint.name,
            start_date=sprint.start_date, end_date=sprint.end_date,
            project_id=sprint.project_id, risk_score=risk,
        ))
    return result

@router.post("/sprints", response_model=SprintResponse)
def create_sprint(payload: SprintCreate, db: Session = Depends(get_db)):
    sprint = Sprint(**payload.dict())
    db.add(sprint); db.commit(); db.refresh(sprint)
    return SprintResponse(
        id=sprint.id, name=sprint.name,
        start_date=sprint.start_date, end_date=sprint.end_date,
        project_id=sprint.project_id, risk_score="Low",
    )

@router.delete("/sprints/{sprint_id}")
def delete_sprint(sprint_id: int, db: Session = Depends(get_db)):
    sprint = db.query(Sprint).filter(Sprint.id == sprint_id).first()
    if not sprint: raise HTTPException(status_code=404, detail="Not found")
    db.delete(sprint); db.commit()
    return {"message": "Deleted"}


@router.get("/sprints/{sprint_id}/tasks", response_model=List[TaskResponse])
def get_sprint_tasks(sprint_id: int, db: Session = Depends(get_db)):
    return db.query(Task).filter(Task.sprint_id == sprint_id).all()

@router.post("/tasks", response_model=TaskResponse)
def create_task(payload: TaskCreate, db: Session = Depends(get_db)):
    task = Task(**payload.dict())
    db.add(task); db.commit(); db.refresh(task)
    return task

@router.patch("/tasks/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, payload: TaskUpdate, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task: raise HTTPException(status_code=404, detail="Not found")
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(task, field, value)
    db.commit(); db.refresh(task)
    return task

@router.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task: raise HTTPException(status_code=404, detail="Not found")
    db.delete(task); db.commit()
    return {"message": "Deleted"}


@router.get("/dashboard/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    total_projects = db.query(Project).count()
    sprints = db.query(Sprint).all()
    high_risk = medium_risk = low_risk = 0
    for sprint in sprints:
        tasks = db.query(Task).filter(Task.sprint_id == sprint.id).all()
        risk = calculate_sprint_risk(tasks, sprint.end_date)
        if risk == "High": high_risk += 1
        elif risk == "Medium": medium_risk += 1
        else: low_risk += 1

    total_tasks = db.query(Task).count()
    done_tasks = db.query(Task).filter(Task.status == "Done").count()
    in_progress = db.query(Task).filter(Task.status == "In_Progress").count()
    todo_tasks = db.query(Task).filter(Task.status == "To_Do").count()
    high_p = db.query(Task).filter(Task.priority == "High").count()
    medium_p = db.query(Task).filter(Task.priority == "Medium").count()
    low_p = db.query(Task).filter(Task.priority == "Low").count()

    return {
        "total_projects": total_projects,
        "total_sprints": len(sprints),
        "high_risk_sprints": high_risk,
        "medium_risk_sprints": medium_risk,
        "low_risk_sprints": low_risk,
        "total_tasks": total_tasks,
        "done_tasks": done_tasks,
        "in_progress_tasks": in_progress,
        "todo_tasks": todo_tasks,
        "priority_distribution": [
            {"priority": "High", "count": high_p},
            {"priority": "Medium", "count": medium_p},
            {"priority": "Low", "count": low_p},
        ],
    }


@router.get("/teams", response_model=List[TeamResponse])
def get_teams(db: Session = Depends(get_db)):
    return db.query(Team).all()

@router.post("/teams", response_model=TeamResponse)
def create_team(payload: TeamCreate, db: Session = Depends(get_db)):
    team = Team(**payload.dict())
    db.add(team); db.commit(); db.refresh(team)
    return team

@router.delete("/teams/{team_id}")
def delete_team(team_id: int, db: Session = Depends(get_db)):
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team: raise HTTPException(status_code=404, detail="Not found")
    db.delete(team); db.commit()
    return {"message": "Deleted"}


@router.get("/users", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()

@router.post("/users", response_model=UserResponse)
def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing: raise HTTPException(status_code=400, detail="Email already registered")
    user = User(**payload.dict())
    db.add(user); db.commit(); db.refresh(user)
    return user

@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user: raise HTTPException(status_code=404, detail="Not found")
    db.delete(user); db.commit()
    return {"message": "Deleted"}


@router.get("/search")
def search(q: str, db: Session = Depends(get_db)):
    projects = db.query(Project).filter(Project.name.ilike(f"%{q}%")).all()
    tasks = db.query(Task).filter(Task.title.ilike(f"%{q}%")).all()
    return {
        "projects": [{"id": p.id, "name": p.name, "type": "project"} for p in projects],
        "tasks": [{"id": t.id, "title": t.title, "status": t.status, "priority": t.priority, "type": "task"} for t in tasks],
    }


@router.get("/timeline")
def get_timeline(db: Session = Depends(get_db)):
    sprints = db.query(Sprint).all()
    result = []
    for sprint in sprints:
        project = db.query(Project).filter(Project.id == sprint.project_id).first()
        tasks = db.query(Task).filter(Task.sprint_id == sprint.id).all()
        risk = calculate_sprint_risk(tasks, sprint.end_date)
        result.append({
            "sprint_id": sprint.id, "sprint_name": sprint.name,
            "project_id": sprint.project_id,
            "project_name": project.name if project else "Unknown",
            "start_date": str(sprint.start_date), "end_date": str(sprint.end_date),
            "risk_score": risk, "task_count": len(tasks),
            "done_count": len([t for t in tasks if t.status == "Done"]),
        })
    return result
