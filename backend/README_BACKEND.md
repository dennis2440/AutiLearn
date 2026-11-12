# AutiLearn Flask backend

## Run on Windows

Open PowerShell in this `backend` folder:

```powershell
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

1. Edit `.env` and enter your MySQL password.
2. Open MySQL Workbench and run `sql/schema.sql`.
3. Start the application:

```powershell
python app.py
```

Visit `http://127.0.0.1:5000`. Test the database at `/api/health`.

## Database tables

- `parent`: parent/guardian accounts.
- `tutor`: tutor accounts.
- `child`: learner profiles owned by a parent. Tutor assignment is optional.
- `history`: matching, spelling and tracing activity results.

Passwords are hashed with Werkzeug and are never stored as plain text.

## API routes

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register a parent or tutor |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/parent/children` | List parent's children |
| POST | `/api/parent/children` | Add a child |
| GET | `/api/parent/summary` | Get progress totals |
| GET | `/api/parent/history` | View children's activity |
| GET | `/api/child/<id>` | View a child profile |
| GET | `/api/tutor/children` | List assigned children |
| GET | `/api/tutor/history` | View assigned children's activity |
| POST | `/api/history` | Save a completed activity |
| GET | `/api/health` | Check MySQL connection |

Protected routes require `Authorization: Bearer ACCESS_TOKEN`.

### Register example

```json
{
  "full_name": "Jane Doe",
  "email": "jane@example.com",
  "password": "a-strong-password",
  "role": "guardian"
}
```

Role must be `guardian` or `tutor`.

### Add child example

```json
{
  "full_name": "Alex Doe",
  "age": 7,
  "learning_level": "beginner"
}
```

### Save activity example

```json
{
  "child_id": 1,
  "activity": "matching",
  "score": 8,
  "total_questions": 10,
  "duration_seconds": 90
}
```

The existing frontend uses a JWT token stored in local storage, so API requests must include the Bearer token. For tutor testing, assign a tutor to a child by setting `child.tutor_id` to an existing tutor ID in MySQL Workbench. A tutor-assignment screen/API is not included yet.
