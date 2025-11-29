// src/pages/Products.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const limit = 6;

  // 🔹 Fonction pour récupérer produits depuis le backend
  const fetchProducts = async (p = 1, s = "") => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/products?search=${s}&page=${p}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProducts(res.data.products || []);
      setTotal(res.data.total || 0);
      setPage(res.data.currentPage || p);
    } catch (err) {
      console.error("Erreur fetch products:", err);
      setProducts([]);
      setTotal(0);
    }
  };

  // 🔹 Charger produits au montage
  useEffect(() => {
    fetchProducts(1, "");
    // eslint-disable-next-line
  }, []);

  // 🔹 Supprimer un produit
  const deleteProduct = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce produit ?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProducts(page, search); // re-fetch après suppression
    } catch (err) {
      console.error("Erreur suppression:", err);
      alert("Impossible de supprimer le produit.");
    }
  };

  // 🔹 Rechercher produits
  const handleSearch = () => {
    fetchProducts(1, search); // reset page = 1 à chaque recherche
  };

  // 🔹 Pagination
  const totalPages = Math.ceil(total / limit);
  const nextPage = () => { if (page < totalPages) fetchProducts(page + 1, search); };
  const prevPage = () => { if (page > 1) fetchProducts(page - 1, search); };

  return (
    <div className="container mt-4">
      <h2>Gestion des Produits</h2>

      {/* Barre de recherche */}
      <div className="input-group my-3" style={{ maxWidth: 400 }}>
        <input
          type="text"
          className="form-control"
          placeholder="Rechercher un produit..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handleSearch}>
          Rechercher
        </button>
      </div>

      <button className="btn btn-success mb-3" onClick={() => navigate("/products/add")}>
        Ajouter Produit
      </button>

      {/* Liste des produits */}
      <div className="row">
        {products.length === 0 ? (
          <p className="text-center">Aucun produit trouvé.</p>
        ) : (
          products.map((p) => (
            <div className="col-md-4 mb-4" key={p.id}>
              <div className="card h-100">
                <img
                  src={`http://localhost:5000/uploads/${p.image}`}
                  className="card-img-top"
                  alt={p.name}
                />
                <div className="card-body">
                  <h5 className="card-title">{p.name}</h5>
                  <p className="card-text">Prix: {p.price} TND</p>
                  <p className="card-text">Quantité: {p.quantity}</p>
                  <button
                    className="btn btn-primary me-2"
                    onClick={() => navigate(`/products/${p.id}`)}
                  >
                    Voir détails
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => deleteProduct(p.id)}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-3">
          <button
            className="btn btn-secondary me-2"
            onClick={prevPage}
            disabled={page === 1}
          >
            ◀ Précédent
          </button>
          <span className="mt-2">Page {page} / {totalPages}</span>
          <button
            className="btn btn-secondary ms-2"
            onClick={nextPage}
            disabled={page === totalPages}
          >
            Suivant ▶
          </button>
        </div>
      )}
    </div>
  );
}
