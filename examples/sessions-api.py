import json
from datetime import datetime, timezone
from typing import Any

from livekit.agents import AutoSubscribe, JobContext, WorkerOptions, cli

MOCK_SESSIONS: list[dict[str, Any]] = [
    {
        "id": "1",
        "title": "Getting Started with AI",
        "preview": "How to use the agent effectively for daily tasks...",
        "updatedAt": "2026-05-23T10:30:00Z",
    },
    {
        "id": "2",
        "title": "Project Architecture Review",
        "preview": "Discussing the microservices migration strategy and API design patterns...",
        "updatedAt": "2026-05-22T14:20:00Z",
    },
    {
        "id": "3",
        "title": "Bug Investigation: Login Issue",
        "preview": "Debugging the authentication flow and session management...",
        "updatedAt": "2026-05-21T09:15:00Z",
    },
]


async def entrypoint(ctx: JobContext) -> None:
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    async def get_sessions(data: str) -> str:
        body = json.loads(data)
        limit = body.get("limit")
        sessions = MOCK_SESSIONS
        if limit is not None and isinstance(limit, int):
            sessions = sessions[:limit]
        return json.dumps({"sessions": sessions})

    ctx.room.local_participant.register_rpc_method("get_sessions", get_sessions)

    print("agent ready — 'get_sessions' RPC method registered")


if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
