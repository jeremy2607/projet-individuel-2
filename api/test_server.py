import uuid
from fastapi.testclient import TestClient
import server

client = TestClient(server.app)


# ---------- Tests unitaires (UT) : logique pure, base mockée ----------

def test_user_model_defaults():
    """UT : le modèle User a bien des champs optionnels par défaut."""
    u = server.User(email="a@b.com", password="x")
    assert u.first_name is None
    assert u.city is None


def test_get_connection_reads_env(monkeypatch):
    """UT : get_connection lit la config depuis les variables d'environnement."""
    captured = {}

    def fake_connect(**kwargs):
        captured.update(kwargs)
        return object()

    monkeypatch.setattr(server.mysql.connector, "connect", fake_connect)
    monkeypatch.setenv("DB_HOST", "myhost")
    monkeypatch.setenv("DB_NAME", "mydb")

    server.get_connection()

    assert captured["host"] == "myhost"
    assert captured["database"] == "mydb"


# ---------- Tests d'intégration (IT) : vrais appels HTTP + vraie base ----------

def test_root():
    r = client.get("/")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_list_users_shape():
    r = client.get("/users")
    assert r.status_code == 200
    body = r.json()
    assert "count" in body and "users" in body
    assert isinstance(body["users"], list)


def test_admin_login_success():
    r = client.post(
        "/login",
        json={"email": "loise.fenoll@ynov.com", "password": "PvdrTAzTeR247sDnAZBr"},
    )
    assert r.status_code == 200
    assert r.json()["is_admin"] == 1


def test_login_failure():
    r = client.post("/login", json={"email": "nope@x.com", "password": "wrong"})
    assert r.status_code == 401


def test_create_then_delete_user():
    """IT : cycle complet inscription -> lecture -> liste -> suppression."""
    email = f"test_{uuid.uuid4().hex[:8]}@ynov.com"

    # inscription
    r = client.post("/users", json={
        "email": email, "password": "pwd",
        "first_name": "Test", "last_name": "User", "city": "Paris",
    })
    assert r.status_code == 201
    uid = r.json()["id"]

    # infos privées
    r = client.get(f"/users/{uid}")
    assert r.status_code == 200
    assert r.json()["email"] == email

    # présent dans la liste
    r = client.get("/users")
    assert any(u["id"] == uid for u in r.json()["users"])

    # suppression
    r = client.delete(f"/users/{uid}")
    assert r.status_code == 200

    # n'existe plus
    r = client.get(f"/users/{uid}")
    assert r.status_code == 404


def test_get_unknown_user_404():
    r = client.get("/users/99999999")
    assert r.status_code == 404
