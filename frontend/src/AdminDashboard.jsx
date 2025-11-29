import { useEffect, useState } from "react";
import axios from "axios";
import Alerts from "./components/Alerts";
import Sidebar from "./components/Sidebar";
import StatsCards from "./components/StatsCards";
import LatestOrders from "./components/LatestOrders";
import SalesChart from "./components/SalesChart";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    const token = localStorage.getItem("token");

    const statsRes = await axios.get("http://localhost:5000/api/admin/stats", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const ordersRes = await axios.get("http://localhost:5000/api/admin/latest-orders", {
      headers: { Authorization: `Bearer ${token}` }
    });

    setStats(statsRes.data);
    setOrders(ordersRes.data);
  };

  if (!stats) return <p>Chargement...</p>;

  return (
    <div className="d-flex">
      <Sidebar />

      <div className="container mt-4">
        <h2>Dashboard Administrateur</h2>
         <Alerts />
        <StatsCards stats={stats} />

        <LatestOrders orders={orders} />

        <SalesChart />
      </div>
    </div>
  );
}
