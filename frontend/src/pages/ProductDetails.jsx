import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function ProductDetails() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const token = localStorage.getItem("token");

    useEffect(() => {
        axios.get(`http://localhost:5000/api/products/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => setProduct(res.data))
          .catch(err => console.error(err));
    }, [id]);

    if (!product) return <p className="text-center mt-5">Chargement...</p>;

    return (
        <div className="container mt-4">
            <h2>Détails du produit</h2>
            <div className="card">
                <img src={`http://localhost:5000/uploads/${product.image}`} className="card-img-top" alt={product.name} height="700" width="3" />
                <div className="card-body">
                    <h5 className="card-title">{product.name}</h5>
                    <p className="card-text">Prix: {product.price} TND</p>
                    <p className="card-text">Quantité: {product.quantity}</p>
                    
                </div>
            </div>
        </div>
    );
}
