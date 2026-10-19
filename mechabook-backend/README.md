# MechaBook Backend

FastAPI + SQLAlchemy + Supabase PostgreSQL backend.

## Setup

```powershell
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Create `.env` from `.env.example` and put your Supabase PostgreSQL connection string in `DATABASE_URL`.

Run:

```powershell
python -m uvicorn app.main:app --reload
```

API docs: http://127.0.0.1:8000/docs
