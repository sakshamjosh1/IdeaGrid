from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, SessionLocal
from app.models.models import Base, Project, Sprint, Task, Team, User
from app.api.routes import router
from datetime import date

app = FastAPI(title="IdeaGrid API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


def seed_data():
    db = SessionLocal()
    try:
        if db.query(Project).count() > 0:
            return  # already seeded

        t1 = Team(name="Backend Squad", description="Handles API and database development")
        t2 = Team(name="Frontend Guild", description="Builds the user interface")
        db.add_all([t1, t2]); db.flush()

        db.add_all([
            User(name="Saksham Joshi", email="saksham@ideagrid.io", role="Project Manager", team_id=t1.id),
            User(name="Vansh Rawat", email="vansh@ideagrid.io", role="Team Member", team_id=t1.id),
            User(name="Mohd. Anas", email="anas@ideagrid.io", role="Team Member", team_id=t2.id),
            User(name="Priya Sharma", email="priya@ideagrid.io", role="Admin", team_id=t2.id),
        ]); db.flush()

        p1 = Project(name="Apollo Platform", description="Mission-critical API platform", start_date=date(2025, 1, 10), end_date=date(2025, 4, 15), status="Active")
        p2 = Project(name="Beacon Analytics", description="Real-time analytics dashboard", start_date=date(2025, 2, 1), end_date=date(2025, 5, 10), status="Active")
        p3 = Project(name="Horizon Mobile", description="Cross-platform mobile application", start_date=date(2025, 3, 1), end_date=date(2025, 6, 30), status="On Hold")
        db.add_all([p1, p2, p3]); db.flush()

        s1 = Sprint(name="Sprint 1 – Foundation", start_date=date(2025, 1, 10), end_date=date(2025, 1, 24), project_id=p1.id)
        s2 = Sprint(name="Sprint 2 – Core APIs", start_date=date(2025, 1, 25), end_date=date(2025, 2, 8), project_id=p1.id)
        s3 = Sprint(name="Sprint 3 – Auth & Security", start_date=date(2025, 2, 9), end_date=date(2025, 2, 23), project_id=p1.id)
        s4 = Sprint(name="Sprint 1 – Data Models", start_date=date(2025, 2, 1), end_date=date(2025, 2, 15), project_id=p2.id)
        s5 = Sprint(name="Sprint 2 – Dashboard UI", start_date=date(2025, 2, 16), end_date=date(2025, 3, 2), project_id=p2.id)
        db.add_all([s1, s2, s3, s4, s5]); db.flush()

        db.add_all([
            Task(title="Setup project repository", priority="High", status="Done", deadline=date(2025, 1, 12), sprint_id=s1.id, assignee="Saksham Joshi"),
            Task(title="Configure database", priority="High", status="Done", deadline=date(2025, 1, 14), sprint_id=s1.id, assignee="Vansh Rawat"),
            Task(title="Create FastAPI structure", priority="Medium", status="Done", deadline=date(2025, 1, 16), sprint_id=s1.id, assignee="Saksham Joshi"),
            Task(title="Write schema definitions", priority="Medium", status="In_Progress", deadline=date(2025, 1, 20), sprint_id=s1.id, assignee="Mohd. Anas"),
            Task(title="Implement project CRUD", priority="High", status="Done", deadline=date(2025, 1, 28), sprint_id=s2.id, assignee="Saksham Joshi"),
            Task(title="Build sprint management API", priority="High", status="In_Progress", deadline=date(2025, 2, 1), sprint_id=s2.id, assignee="Vansh Rawat"),
            Task(title="Task assignment endpoint", priority="Medium", status="To_Do", deadline=date(2025, 2, 5), sprint_id=s2.id, assignee="Mohd. Anas"),
            Task(title="Write unit tests", priority="High", status="To_Do", deadline=date(2025, 2, 7), sprint_id=s2.id, assignee="Saksham Joshi"),
            Task(title="JWT authentication", priority="High", status="In_Progress", deadline=date(2025, 2, 12), sprint_id=s3.id, assignee="Saksham Joshi"),
            Task(title="Role-based access control", priority="High", status="To_Do", deadline=date(2025, 2, 15), sprint_id=s3.id, assignee="Vansh Rawat"),
            Task(title="Password hashing", priority="High", status="To_Do", deadline=date(2025, 2, 16), sprint_id=s3.id, assignee="Mohd. Anas"),
            Task(title="Session management", priority="Medium", status="To_Do", deadline=date(2025, 2, 20), sprint_id=s3.id, assignee="Priya Sharma"),
            Task(title="Define analytics models", priority="High", status="Done", deadline=date(2025, 2, 5), sprint_id=s4.id, assignee="Saksham Joshi"),
            Task(title="Create ETL pipeline", priority="Medium", status="Done", deadline=date(2025, 2, 8), sprint_id=s4.id, assignee="Vansh Rawat"),
            Task(title="Mock data scripts", priority="Low", status="Done", deadline=date(2025, 2, 12), sprint_id=s4.id, assignee="Mohd. Anas"),
            Task(title="Build chart components", priority="High", status="In_Progress", deadline=date(2025, 2, 20), sprint_id=s5.id, assignee="Priya Sharma"),
            Task(title="Dashboard layout", priority="High", status="Review", deadline=date(2025, 2, 22), sprint_id=s5.id, assignee="Saksham Joshi"),
            Task(title="Connect charts to live data", priority="Medium", status="To_Do", deadline=date(2025, 2, 28), sprint_id=s5.id, assignee="Vansh Rawat"),
            Task(title="Responsive mobile styling", priority="Low", status="To_Do", deadline=date(2025, 3, 1), sprint_id=s5.id, assignee="Mohd. Anas"),
        ])
        db.commit()
        print("✅ Seed data inserted")
    except Exception as e:
        db.rollback()
        print(f"Seed error: {e}")
    finally:
        db.close()


@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    seed_data()


@app.get("/")
def root():
    return {"message": "IdeaGrid API is running 🚀"}
