import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AddProduct() {
    const [form, setForm] = useState({ name: "", price: "", quantity: "", image: null });
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
    const handleFile = (e) => setForm({ ...form, image: e.target.files[0] });

    const handleSubmit = () => {
        const data = new FormData();
        data.append("name", form.name);
        data.append("price", form.price);
        data.append("quantity", form.quantity);
        if (form.image) data.append("image", form.image);

        axios.post("http://localhost:5000/api/products", data, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data"
            }
        }).then(() => navigate("/products"))
          .catch(err => alert("Erreur ajout produit"));
    };

    return (
        <div className="container mt-4">
            <h2>Ajouter un produit</h2>

            <div className="card p-3 mt-3">
                <input className="form-control mb-2" name="name" placeholder="Nom" onChange={handleChange} />
                <input className="form-control mb-2" name="price" placeholder="Prix" onChange={handleChange} />
                <input className="form-control mb-2" name="quantity" placeholder="Quantité" onChange={handleChange} />
                <input type="file" className="form-control mb-2" onChange={handleFile} />

                <button className="btn btn-primary" onClick={handleSubmit}>Ajouter</button>
            </div>
        </div>
    );
}
