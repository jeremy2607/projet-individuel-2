import { useState, useEffect } from "react";
import "./App.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

const EMPTY_FORM = {
  email: "",
  password: "",
  first_name: "",
  last_name: "",
  birth_date: "",
  city: "",
  postal_code: "",
};

export default function App() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [message, setMessage] = useState("");
  const [admin, setAdmin] = useState(null);
  const [login, setLogin] = useState({ email: "", password: "" });
  const [details, setDetails] = useState(null);

  async function loadUsers() {
    try {
      const res = await fetch(`${API}/users`);
      const data = await res.json();
      setUsers(data.users || []);
    } catch {
      /* réseau indisponible : on garde la liste courante */
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleRegister(e) {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch(`${API}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setMessage("Inscription enregistrée ✅");
        setForm(EMPTY_FORM);
        loadUsers();
      } else {
        setMessage("Erreur lors de l'inscription ❌");
      }
    } catch {
      setMessage("Erreur réseau ❌");
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(login),
      });
      if (res.ok) {
        setAdmin(await res.json());
        setLogin({ email: "", password: "" });
      } else {
        setMessage("Identifiants invalides ❌");
      }
    } catch {
      setMessage("Erreur réseau ❌");
    }
  }

  async function handleDelete(id) {
    try {
      await fetch(`${API}/users/${id}`, { method: "DELETE" });
      setDetails(null);
      loadUsers();
    } catch {
      /* ignore */
    }
  }

  async function viewDetails(id) {
    try {
      const res = await fetch(`${API}/users/${id}`);
      setDetails(await res.json());
    } catch {
      /* ignore */
    }
  }

  const isAdmin = admin && admin.is_admin;

  return (
    <div className="container">
      <h1>Ynov CI — Utilisateurs</h1>

      <section className="card">
        <h2>Inscription</h2>
        <form onSubmit={handleRegister}>
          <input required type="email" placeholder="Email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input required type="password" placeholder="Mot de passe" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <input placeholder="Prénom" value={form.first_name}
            onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
          <input placeholder="Nom" value={form.last_name}
            onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
          <input type="date" value={form.birth_date}
            onChange={(e) => setForm({ ...form, birth_date: e.target.value })} />
          <input placeholder="Ville" value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <input placeholder="Code postal" value={form.postal_code}
            onChange={(e) => setForm({ ...form, postal_code: e.target.value })} />
          <button type="submit">S'inscrire</button>
        </form>
        {message && <p className="message">{message}</p>}
      </section>

      <section className="card">
        <h2>Liste des inscrits ({users.length})</h2>
        <ul className="user-list">
          {users.map((u) => (
            <li key={u.id}>
              <span>{u.first_name} {u.last_name} {u.city ? `— ${u.city}` : ""}</span>
              {isAdmin && (
                <span className="actions">
                  <button onClick={() => viewDetails(u.id)}>Détails</button>
                  <button className="danger" onClick={() => handleDelete(u.id)}>Supprimer</button>
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2>Espace administrateur</h2>
        {!isAdmin ? (
          <form onSubmit={handleLogin}>
            <input type="email" placeholder="Email admin" value={login.email}
              onChange={(e) => setLogin({ ...login, email: e.target.value })} />
            <input type="password" placeholder="Mot de passe admin" value={login.password}
              onChange={(e) => setLogin({ ...login, password: e.target.value })} />
            <button type="submit">Connexion admin</button>
          </form>
        ) : (
          <>
            <p>Connecté en tant que <strong>{admin.email}</strong></p>
            <button onClick={() => { setAdmin(null); setDetails(null); }}>Déconnexion</button>
            {details && (
              <div className="details">
                <h3>Infos privées #{details.id}</h3>
                <pre>{JSON.stringify(details, null, 2)}</pre>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
