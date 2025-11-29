import { useState } from "react";
import axios from "axios";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("employee");

  async function handleRegister(e) {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/auth/register",
        { email, password, role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Utilisateur créé avec succès !");
      setEmail(""); setPassword(""); setRole("employee");
    } catch (err) {
      alert(err.response.data.message || "Erreur lors de l'inscription");
    }
  }

  return (
    <div className="container mt-5" style={{ maxWidth: 450 }}>
      <h3>Créer un nouvel utilisateur</h3>
      <form onSubmit={handleRegister}>
        <div className="mb-3">
          <label>Email</label>
          <input type="email" className="form-control"
            value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label>Mot de passe</label>
          <input type="password" className="form-control"
            value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label>Rôle</label>
          <select className="form-control" value={role} onChange={e => setRole(e.target.value)}>
            <option value="employee">Employé</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <button className="btn btn-success w-100">Créer l'utilisateur</button>
      </form>
    </div>
  );
}
