// src/pages/OrdersList.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role"); // "admin" ou "employee"
  const limit = 10;

  const totalPages = Math.ceil(total / limit);

  const fetchOrders = async () => {
    try {
      const url = new URL("http://localhost:5000/api/orders");
      url.searchParams.append("page", page);
      url.searchParams.append("limit", limit);
      if (statusFilter !== "all") {
        url.searchParams.append("status", statusFilter);
      }

      const res = await axios.get(url.toString(), {
        headers: { Authorization: `Bearer ${token}` }
      });

      setOrders(res.data.orders || []);
      setTotal(res.data.total || res.data.totalPages * limit || 0);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const deleteOrder = async (id) => {
    if (!window.confirm("Supprimer cette commande ?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchOrders();
    } catch (err) {
      alert(err?.response?.data?.message || "Erreur suppression");
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await axios.put(
        `http://localhost:5000/api/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrders();
    } catch (err) {
      alert(err?.response?.data?.message || "Erreur mise à jour statut");
    }
  };

  const nextPage = () => { if (page < totalPages) setPage(page + 1); };
  const prevPage = () => { if (page > 1) setPage(page - 1); };

  // Statuts autorisés selon rôle
  const statusOptions = ["en attente", "payée", "expédiée", "annulée"];
  const employeeAllowed = ["en attente", "payée", "expédiée"];

  return (
    <div className="container mt-4">
      <h2>Commandes</h2>

      <div className="d-flex mb-3 justify-content-between">
        <Link to="/orders/add" className="btn btn-primary">Créer une commande</Link>

        <select
          className="form-select w-auto"
          value={statusFilter}
          onChange={e => { setPage(1); setStatusFilter(e.target.value); }}
        >
          <option value="all">Tous les statuts</option>
          {statusOptions.map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      <table className="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Client</th>
            <th>Total</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.id}>
              <td>{o.id}</td>
              <td>{o.customer_name || "-"}</td>
              <td>{o.total} TND</td>
              <td>
                <select
                  className="form-select"
                  value={o.status}
                  onChange={e => {
                    const newStatus = e.target.value;
                    if (userRole === "employee" && !employeeAllowed.includes(newStatus)) {
                      alert("Permission refusée");
                      return;
                    }
                    updateStatus(o.id, newStatus);
                  }}
                  disabled={userRole === "employee" && !employeeAllowed.includes(o.status)}
                >
                  {statusOptions.map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </td>
              <td>
                <Link to={`/orders/${o.id}`} className="btn btn-sm btn-info me-2">Voir</Link>
                {userRole === "admin" && (
                  <button className="btn btn-sm btn-danger" onClick={() => deleteOrder(o.id)}>Supprimer</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="d-flex justify-content-center mt-3">
        <button className="btn btn-secondary me-2" onClick={prevPage} disabled={page === 1}>◀ Précédent</button>
        <span className="mt-2">Page {page} / {totalPages}</span>
        <button className="btn btn-secondary ms-2" onClick={nextPage} disabled={page === totalPages}>Suivant ▶</button>
      </div>
    </div>
  );
}
