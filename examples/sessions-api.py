from datetime import datetime, timezone
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Chat Sessions API")


class SessionOut(BaseModel):
    id: str
    title: str
    preview: str
    updatedAt: str


class SessionsOut(BaseModel):
    sessions: list[SessionOut]


SESSIONS: list[SessionOut] = [
    SessionOut(
        id="1",
        title="Getting Started with AI",
        preview="How to use the agent effectively for daily tasks...",
        updatedAt="2026-05-23T10:30:00Z",
    ),
    SessionOut(
        id="2",
        title="Project Architecture Review",
        preview="Discussing the microservices migration strategy and API design patterns...",
        updatedAt="2026-05-22T14:20:00Z",
    ),
    SessionOut(
        id="3",
        title="Bug Investigation: Login Issue",
        preview="Debugging the authentication flow and session management...",
        updatedAt="2026-05-21T09:15:00Z",
    ),
]


class SessionsIn(BaseModel):
    limit: int | None = None


@app.post("/sessions", response_model=SessionsOut)
def list_sessions(body: SessionsIn):
    sessions = SESSIONS
    if body.limit is not None:
        sessions = sessions[: body.limit]
    return SessionsOut(sessions=sessions)
