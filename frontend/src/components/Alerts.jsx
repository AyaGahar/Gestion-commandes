import { useEffect, useState } from "react";
import axios from "axios";

export default function Alerts({ pendingOrders: externalPendingOrders = null }) {
  const [alerts, setAlerts] = useState({
    lowStockProducts: [],
    pendingOrders: []
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    // 🔹 Si les alertes sont fournies par le parent (EmployeeDashboard)
    if (externalPendingOrders !== null) {
      setAlerts({
        lowStockProducts: [],
        pendingOrders: externalPendingOrders
      });
      return;
    }

    // 🔹 Sinon → mode Admin → on fetch depuis API admin
    const fetchAdminAlerts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/admin/alerts", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAlerts(res.data);
      } catch (err) {
        console.error(err);

        if (err.response?.status === 401 || err.response?.status === 403) {
          alert("Session expirée ou accès refusé.");
          localStorage.removeItem("token");
          window.location.href = "/";
        }
      }
    };

    fetchAdminAlerts();
    const itv = setInterval(fetchAdminAlerts, 5 * 60 * 1000);

    return () => clearInterval(itv);
  }, [externalPendingOrders]);

  return (
    <div className="mb-4">
      {/* 🔥 Alertes Admin uniquement */}
      {alerts.lowStockProducts?.length > 0 && (
        <div className="alert alert-danger">
          <strong>Stock faible :</strong>
          <ul>
            {alerts.lowStockProducts.map(p => (
              <li key={p.id}>
                {p.name} – {p.quantity} restant
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 🔥 Alertes Admin & Employé */}
      {alerts.pendingOrders?.length > 0 && (
        <div className="alert alert-warning">
          <strong>Commandes en attente depuis plus de 24h :</strong>
          <ul>
            {alerts.pendingOrders.map(o => (
              <li key={o.id}>
                Commande #{o.id} —{" "}
                {o.customer_name || "Client inconnu"} —{" "}
                {new Date(o.created_at).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
