// src/pages/EmployeeDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import EmployeeOrdersTable from "./components/EmployeeOrdersTable";
import Alerts from "./components/Alerts";

export default function EmployeeDashboard() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [alerts, setAlerts] = useState({ pendingOrders: [] });
    const [search, setSearch] = useState("");
  const token = localStorage.getItem("token");
  const refreshIntervalMs = 60 * 1000; // rafraîchir toutes les 60s

  useEffect(() => {
    fetchUser();
    fetchOrders();
    fetchAlerts();

    const itv = setInterval(() => {
      fetchOrders();
      fetchAlerts();
    }, refreshIntervalMs);

    return () => clearInterval(itv);
    // eslint-disable-next-line
  }, []);

  const fetchUser = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/employee/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.user || res.data);
    } catch (err) {
      console.error(err);
      alert("Accès refusé ou token invalide");
      window.location.href = "/";
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/employee/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // si backend renvoie { orders: [] } ou [] adapte
      setOrders(res.data.orders || res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAlerts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/employee/alerts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlerts(res.data || { pendingOrders: [] });
    } catch (err) {
      console.error(err);
    }
  };

   // 🔍 Rechercher par nom de client
  const searchOrders = async () => {
    if (!search.trim()) {
      fetchOrders(); // Si barre vide → afficher tout
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:5000/api/employee/search?name=${search}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return <p className="text-center mt-5">Chargement...</p>;
  const filteredOrders = orders.filter((o) =>
  o.customer_name?.toLowerCase().includes(search.toLowerCase())
);

  return (
    <div className="container-fluid mt-4">
      <div className="d-flex align-items-center mb-4">
        <div>
          <h3 className="mb-0">Dashboard Employé</h3>
          <small className="text-muted">Bienvenue, {user.email} — rôle : {user.role}</small>
        </div>
      </div>

      <Alerts pendingOrders={alerts.pendingOrders || []} />

      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Commandes à traiter</h5>
          {/* 🔍 Barre de recherche */}
          <div className="input-group" style={{ width: "300px" }}>
            <input
              type="text"
              className="form-control"
              placeholder="Nom du client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn btn-primary" onClick={searchOrders}>
              Rechercher
            </button>
          </div>
          <small className="text-muted">Mise à jour automatique toutes les 60s</small>
        </div>
        <div className="card-body">
          <EmployeeOrdersTable orders={filteredOrders} onRefresh={fetchOrders} />

        </div>
      </div>
    </div>
  );
}
