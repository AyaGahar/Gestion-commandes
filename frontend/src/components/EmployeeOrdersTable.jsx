// src/components/EmployeeOrdersTable.jsx
import React from "react";
import axios from "axios";
import PropTypes from "prop-types";

export default function EmployeeOrdersTable({ orders, onRefresh }) {
  const token = localStorage.getItem("token");

  // ordre des statuts pour l'avancement (défini côté frontend)
  const steps = ["en attente", "payée", "expédiée"];
  const statusClass = {
    "en attente": "badge bg-secondary",
    "payée": "badge bg-success",
    "expédiée": "badge bg-primary",
    "annulée": "badge bg-danger"
  };

  const advanceStatus = async (order) => {
    try {
      const current = order.status;
      const idx = steps.indexOf(current);
      if (idx === -1) {
        return alert("Impossible d'avancer le statut depuis : " + current);
      }
      const next = steps[idx + 1];
      if (!next) return alert("Statut final atteint");

      await axios.put(`http://localhost:5000/api/orders/${order.id}/status`, { status: next }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onRefresh();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Erreur lors de la mise à jour du statut");
    }
  };

  const setStatusDirect = async (orderId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onRefresh();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Erreur mise à jour statut");
    }
  };

  return (
    <div className="table-responsive">
      <table className="table align-middle">
        <thead>
          <tr>
            <th>ID</th>
            <th>Client</th>
            <th>Total</th>
            <th>Créé le</th>
            <th>Status</th>
            <th className="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 && (
            <tr>
              <td colSpan="6" className="text-center">Aucune commande à traiter</td>
            </tr>
          )}

          {orders.map(o => (
            <tr key={o.id}>
              <td>#{o.id}</td>
              <td>{o.customer_name || "-"}</td>
              <td>{Number(o.total || 0).toFixed(2)} TND</td>
              <td>{new Date(o.created_at).toLocaleString()}</td>
              <td>
                <span className={statusClass[o.status] || "badge bg-light text-dark"}>
                  {o.status}
                </span>
              </td>
              <td className="text-end">
                {/* Bouton avancé statut */}
                <button
                  className="btn btn-sm btn-outline-primary me-2"
                  onClick={() => advanceStatus(o)}
                  disabled={o.status === "expédiée" || o.status === "annulée"}
                >
                  Avancer statut
                </button>

                {/* Select pour changer directement parmi les statuts autorisés */}
                <select
                  className="form-select form-select-sm d-inline-block"
                  style={{ width: 160 }}
                  value={o.status}
                  onChange={(e) => setStatusDirect(o.id, e.target.value)}
                >
                  {steps.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

EmployeeOrdersTable.propTypes = {
  orders: PropTypes.array.isRequired,
  onRefresh: PropTypes.func.isRequired
};
