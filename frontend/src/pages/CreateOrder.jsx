import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function CreateOrder() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:5000/api/products?page=1&limit=1000", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setProducts(res.data.products || res.data || []))
      .catch(err => console.error(err));
  }, [token]);

  function addToCart(product, qty = 1) {
    const existing = cart.find(c => c.product_id === product.id);
    const stockAvailable = product.quantity - (existing?.quantity || 0);

    if (qty > stockAvailable) {
      return alert(`Stock insuffisant. Disponible: ${stockAvailable}`);
    }

    if (existing) {
      setCart(cart.map(c => c.product_id === product.id ? { ...c, quantity: c.quantity + qty } : c));
    } else {
      setCart([...cart, { product_id: product.id, name: product.name, price: product.price, quantity: qty }]);
    }
  }

  function changeQty(pid, qty) {
    const product = products.find(p => p.id === pid);
    if (!product) return;

    const stockAvailable = product.quantity;
    if (qty > stockAvailable) return alert(`Stock insuffisant. Disponible: ${stockAvailable}`);

    if (qty <= 0) {
      setCart(cart.filter(c => c.product_id !== pid));
    } else {
      setCart(cart.map(c => c.product_id === pid ? { ...c, quantity: qty } : c));
    }
  }

  function removeFromCart(pid) {
    setCart(cart.filter(c => c.product_id !== pid));
  }

  const total = cart.reduce((s, c) => s + c.price * c.quantity, 0).toFixed(2);

  async function submitOrder() {
    if (cart.length === 0) return alert("Panier vide");

    // Vérifier stock avant soumission
    for (const c of cart) {
      const prod = products.find(p => p.id === c.product_id);
      if (!prod || c.quantity > prod.quantity) {
        return alert(`Stock insuffisant pour ${c.name}. Disponible: ${prod?.quantity || 0}`);
      }
    }

    try {
      const payload = {
        customer_name: customer,
        items: cart.map(c => ({ product_id: c.product_id, quantity: c.quantity }))
      };
      const res = await axios.post("http://localhost:5000/api/orders", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Commande créée (id: " + res.data.orderId + ")");
      navigate("/orders");
    } catch (err) {
      alert(err?.response?.data?.message || "Erreur création commande");
    }
  }

  return (
    <div className="container mt-4">
      <h2>Créer une commande</h2>
      <div className="row">
        <div className="col-md-7">
          <h5>Produits</h5>
          <div className="row">
            {products.map(p => {
              const inCart = cart.find(c => c.product_id === p.id);
              const stockLeft = p.quantity - (inCart?.quantity || 0);

              return (
                <div key={p.id} className="col-md-6 mb-3">
                  <div className="card h-100">
                    <img src={`http://localhost:5000/uploads/${p.image || 'default.jpg'}`} className="card-img-top" alt={p.name} />
                    <div className="card-body">
                      <h6>{p.name}</h6>
                      <p className="mb-1">Prix: {p.price} TND</p>
                      <p className="mb-1">Stock: {stockLeft}</p>
                      <div className="d-flex">
                        <button className="btn btn-sm btn-primary me-2" disabled={stockLeft <= 0} onClick={() => addToCart(p, 1)}>
                          Ajouter 1
                        </button>
                        <button className="btn btn-sm btn-secondary" onClick={() => {
                          const q = parseInt(prompt("Quantité à ajouter", "1"));
                          if (q > 0) addToCart(p, q);
                        }}>Ajouter quantité</button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="col-md-5">
          <div className="card p-3">
            <h5>Panier</h5>
            <input className="form-control mb-2" placeholder="Nom client (optionnel)" value={customer} onChange={e => setCustomer(e.target.value)} />

            {cart.length === 0 ? <p>Panier vide</p> : (
              <div>
                {cart.map(c => (
                  <div key={c.product_id} className="d-flex align-items-center mb-2">
                    <div style={{ flex: 1 }}>
                      <strong>{c.name}</strong><br />
                      <small>{c.price} TND</small>
                    </div>
                    <input type="number" value={c.quantity} min="1" className="form-control form-control-sm me-2" style={{ width: 80 }}
                      onChange={e => changeQty(c.product_id, Number(e.target.value))} />
                    <button className="btn btn-sm btn-danger" onClick={() => removeFromCart(c.product_id)}>Suppr</button>
                  </div>
                ))}
                <hr />
                <p><strong>Total: {total} TND</strong></p>
                <button className="btn btn-success w-100" onClick={submitOrder}>Valider la commande</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
