import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`http://localhost:5000/api/orders/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        setOrder(res.data.order);
        setItems(res.data.items);
      }).catch(()=>{ alert("Impossible de charger"); navigate("/orders"); });
  }, [id]);

  if (!order) return <p>Chargement...</p>;

  return (
    <div className="container mt-4">
      <h2>Détails commande #{order.id}</h2>
      <p><strong>Client:</strong> {order.customer_name}</p>
      <p><strong>Créée par:</strong> {order.created_by}</p>
      <p><strong>Total:</strong> {order.total} TND</p>
      <p><strong>Status:</strong> {order.status}</p>

      <h4 className="mt-3">Produits</h4>
      <table className="table">
        <thead><tr><th>Produit</th><th>Prix</th><th>Qte</th><th>Sous-total</th></tr></thead>
        <tbody>
          {items.map(it => (
            <tr key={it.id}>
              <td>
                {it.product_name}
                {it.product_image && <div><img src={`http://localhost:5000/uploads/${it.product_image}`} alt="" style={{width:80}}/></div>}
              </td>
              <td>{it.price} TND</td>
              <td>{it.quantity}</td>
              <td>{it.subtotal} TND</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
