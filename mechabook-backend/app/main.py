from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine

from .routers import (
    auth,
    communities,
    marketplace,
    messages,
    posts,
    search,
    sound_tests,
    switches,
    users,
)


# Create database tables
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Mechabook API",
    description="Backend API for the Mechabook mechanical keyboard community.",
    version="1.0.0",
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://192.168.0.2:3000",
        "http://192.168.0.3:3000",
        "http://192.168.0.4:3000",
        "http://192.168.0.5:3000",
        "http://192.168.0.6:3000",
        "http://192.168.0.7:3000",
        "http://192.168.0.8:3000",
        "http://192.168.0.9:3000",
        "http://192.168.0.10:3000",
        "http://192.168.0.11:3000",
        "http://192.168.0.12:3000",
        "http://192.168.0.13:3000",
        "http://192.168.0.14:3000",
        "http://192.168.0.15:3000",
        "http://192.168.0.16:3000",
        "http://192.168.0.17:3000",
        "http://192.168.0.18:3000",
        "http://192.168.0.19:3000",
        "http://192.168.0.20:3000",
        "http://192.168.0.21:3000",
        "http://192.168.0.22:3000",
        "http://192.168.0.23:3000",
        "http://192.168.0.24:3000",
        "http://192.168.0.25:3000",
        "http://192.168.0.26:3000",
        "http://192.168.0.27:3000",
        "http://192.168.0.28:3000",
        "http://192.168.0.29:3000",
        "http://192.168.0.30:3000",
        "http://192.168.0.31:3000",
        "http://192.168.0.32:3000",
        "http://192.168.0.33:3000",
        "http://192.168.0.34:3000",
        "http://192.168.0.35:3000",
        "http://192.168.0.36:3000",
        "http://192.168.0.37:3000",
        "http://192.168.0.38:3000",
        "http://192.168.0.39:3000",
        "http://192.168.0.40:3000",
        "http://192.168.0.41:3000",
        "http://192.168.0.42:3000",
        "http://192.168.0.43:3000",
        "http://192.168.0.44:3000",
        "http://192.168.0.45:3000",
        "http://192.168.0.46:3000",
        "http://192.168.0.47:3000",
        "http://192.168.0.48:3000",
        "http://192.168.0.49:3000",
        "http://192.168.0.50:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# Routers
# =========================================================

app.include_router(auth.router)

app.include_router(users.router)

app.include_router(posts.router)

app.include_router(marketplace.router)

app.include_router(communities.router)

app.include_router(messages.router)

app.include_router(search.router)

app.include_router(sound_tests.router)

app.include_router(switches.router)


# =========================================================
# Basic Routes
# =========================================================

@app.get("/")
def root():
    return {
        "message": "Mechabook API is running",
        "version": "1.0.0",
    }


@app.get("/health")
def health_check():
    return {
        "status": "ok",
    }