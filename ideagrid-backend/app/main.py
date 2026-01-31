from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.schemas.project import ProjectResponse
from datetime import date

app = FastAPI(title="IdeaGrid API")

# 🔑 CORS CONFIG
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.get("/projects", response_model=list[ProjectResponse])
def get_projects():
    return fake_projects
