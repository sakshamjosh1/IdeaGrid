from sqlalchemy import Column, Integer, String, Date, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    status = Column(String, default="Active")

    sprints = relationship("Sprint", back_populates="project", cascade="all, delete")


class Sprint(Base):
    __tablename__ = "sprints"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)

    project = relationship("Project", back_populates="sprints")
    tasks = relationship("Task", back_populates="sprint", cascade="all, delete")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    priority = Column(String, default="Medium")
    status = Column(String, default="To_Do")
    deadline = Column(Date, nullable=True)
    sprint_id = Column(Integer, ForeignKey("sprints.id"), nullable=False)
    assignee = Column(String, nullable=True)

    sprint = relationship("Sprint", back_populates="tasks")


class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)

    members = relationship("User", back_populates="team", cascade="all, delete")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    role = Column(String, default="Team Member")
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)

    team = relationship("Team", back_populates="members")