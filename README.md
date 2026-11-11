# AutiLearn

## Run locally
```bash
# 1. MySQL: create the DB + user (see backend/sql/schema.sql)
cd backend
python -m venv venv && source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                                  # then edit DB_* values
flask --app app init-db                               # creates tables
flask --app app run --debug                           # http://localhost:5000
```
Open http://localhost:5000 and it should say "Server: ok". API check: http://localhost:5000/api/health

## Capacitor (later)
`frontend/` is the Capacitor `webDir`. Set `API_BASE` in `frontend/js/core/config.js` to the deployed Flask URL.
