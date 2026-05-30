from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Commands API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

COMMANDS = [
    {"command": "/help", "description": "Show available commands", "example": "/help"},
    {"command": "/clear", "description": "Clear the chat transcript", "example": "/clear"},
    {"command": "/feedback", "description": "Send feedback about the agent", "example": "/feedback The agent was helpful"},
    {"command": "/summarize", "description": "Summarize the conversation", "example": "/summarize"},
    {"command": "/voice", "description": "Switch to voice-only mode", "example": "/voice"},
    {"command": "/realtime", "description": "Switch to real-time mode", "example": "/realtime"},
    {"command": "/call", "description": "Initiate a call", "example": "/call"},
]


@app.get("/commands")
async def get_commands():
    return {"commands": COMMANDS}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
