import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import mysql.connector

app = FastAPI(title="Ynov CI API")

# CORS : autorise le front React (GitHub Pages / localhost) à appeler l'API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "db"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        database=os.getenv("DB_NAME", "ynov_ci"),
        port=int(os.getenv("DB_PORT", "3306")),
    )


class User(BaseModel):
    email: str
    password: str
    first_name: str | None = None
    last_name: str | None = None
    birth_date: str | None = None
    city: str | None = None
    postal_code: str | None = None


@app.get("/")
def root():
    return {"status": "ok", "service": "ynov-ci-api"}


class Credentials(BaseModel):
    email: str
    password: str


@app.post("/login")
def login(creds: Credentials):
    """Connexion : renvoie le profil si identifiants valides (utilisé pour l'admin)."""
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    cur.execute(
        "SELECT id, email, first_name, last_name, is_admin "
        "FROM users WHERE email = %s AND password = %s",
        (creds.email, creds.password),
    )
    row = cur.fetchone()
    cur.close()
    conn.close()
    if not row:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return row


@app.get("/users")
def list_users():
    """Liste publique : informations réduites uniquement."""
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    cur.execute("SELECT id, first_name, last_name, city FROM users")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return {"count": len(rows), "users": rows}


@app.get("/users/{user_id}")
def get_user(user_id: int):
    """Informations privées (réservé admin côté front)."""
    conn = get_connection()
    cur = conn.cursor(dictionary=True)
    cur.execute(
        "SELECT id, email, first_name, last_name, birth_date, city, postal_code, is_admin "
        "FROM users WHERE id = %s",
        (user_id,),
    )
    row = cur.fetchone()
    cur.close()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    return row


@app.post("/users", status_code=201)
def create_user(user: User):
    # Les champs optionnels vides ("") deviennent NULL (sinon MySQL rejette "" pour une DATE)
    def clean(v):
        return v if v not in ("", None) else None

    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO users (email, password, first_name, last_name, birth_date, city, postal_code) "
        "VALUES (%s, %s, %s, %s, %s, %s, %s)",
        (user.email, user.password, clean(user.first_name), clean(user.last_name),
         clean(user.birth_date), clean(user.city), clean(user.postal_code)),
    )
    conn.commit()
    new_id = cur.lastrowid
    cur.close()
    conn.close()
    return {"id": new_id, "email": user.email}


@app.delete("/users/{user_id}")
def delete_user(user_id: int):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM users WHERE id = %s", (user_id,))
    conn.commit()
    deleted = cur.rowcount
    cur.close()
    conn.close()
    if deleted == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"deleted": user_id}
