from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import date
from typing import Optional
from app.schemas.project import ProjectResponse
from app.schemas.sprint import SprintResponse
from app.schemas.task import TaskResponse

app = FastAPI(title="IdeaGrid API")

# -----------------------------------
# CORS CONFIG
# -----------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------------
# FAKE DATA (Temporary Until DB)
# -----------------------------------

fake_projects = [
    {
        "id": 1,
        "name": "Apollo",
        "description": "Mission critical platform",
        "start_date": date(2024, 1, 10),
        "end_date": date(2024, 3, 15),
    },
    {
        "id": 2,
        "name": "Beacon",
        "description": "Internal analytics tool",
        "start_date": date(2024, 2, 1),
        "end_date": date(2024, 4, 10),
    },
]

fake_sprints = [
    {
        "id": 1,
        "name": "Sprint 1",
        "start_date": date(2024, 1, 10),
        "end_date": date(2024, 1, 24),
        "project_id": 1,
    },
    {
        "id": 2,
        "name": "Sprint 2",
        "start_date": date(2024, 2, 1),
        "end_date": date(2024, 2, 15),
        "project_id": 1,
    },
]

fake_tasks = [
    {
        "id": 1,
        "title": "Setup database",
        "priority": "High",
        "status": "In_Progress",
        "deadline": date(2024, 1, 20),
        "sprint_id": 1,
    },
    {
        "id": 2,
        "title": "Build API routes",
        "priority": "Medium",
        "status": "To_Do",
        "deadline": date(2024, 1, 22),
        "sprint_id": 1,
    },
]

# -----------------------------------
# SPRINT RISK LOGIC
# -----------------------------------

def calculate_sprint_risk(tasks):
    if not tasks:
        return "Low"

    total = len(tasks)
    incomplete = [t for t in tasks if t["status"] != "Done"]
    high_priority_incomplete = [
        t for t in incomplete if t["priority"] == "High"
    ]

    incomplete_ratio = len(incomplete) / total

    if incomplete_ratio > 0.6 or len(high_priority_incomplete) > 1:
        return "High"
    elif incomplete_ratio > 0.3:
        return "Medium"
    else:
        return "Low"


# -----------------------------------
# ENDPOINTS
# -----------------------------------

@app.get("/projects", response_model=list[ProjectResponse])
def get_projects():
    return fake_projects


@app.get("/projects/{project_id}/sprints")
def get_project_sprints(project_id: int):
    project_sprints = [
        s for s in fake_sprints if s["project_id"] == project_id
    ]

    enriched_sprints = []

    for sprint in project_sprints:
        sprint_tasks = [
            t for t in fake_tasks if t["sprint_id"] == sprint["id"]
        ]

        risk_score = calculate_sprint_risk(sprint_tasks)

        enriched_sprint = {
            **sprint,
            "risk_score": risk_score
        }

        enriched_sprints.append(enriched_sprint)

    return enriched_sprints


@app.get("/sprints/{sprint_id}/tasks", response_model=list[TaskResponse])
def get_sprint_tasks(sprint_id: int):
    return [
        t for t in fake_tasks if t["sprint_id"] == sprint_id
    ]

@app.get("/dashboard/summary")
def get_dashboard_summary():
    total_projects = len(fake_projects)
    total_sprints = len(fake_sprints)

    high_risk = 0
    low_risk = 0
    medium_risk = 0

    for sprint in fake_sprints:
        sprint_tasks = [
            t for t in fake_tasks if t["sprint_id"] == sprint["id"]
        ]
        risk = calculate_sprint_risk(sprint_tasks)

        if risk == "High":
            high_risk += 1
        elif risk == "Medium":
            medium_risk += 1
        else:
            low_risk += 1

    return {
        "total_projects": total_projects,
        "total_sprints": total_sprints,
        "high_risk_sprints": high_risk,
        "medium_risk_sprints": medium_risk,
        "low_risk_sprints": low_risk,
    }