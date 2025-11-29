export default function Sidebar() {
  return (
    <div className="bg-dark text-white p-3 vh-100" style={{ width: "250px" }}>
      <h4>Admin Panel</h4>
      <hr />

      <a href="/admin" className="text-white d-block mb-3">Dashboard</a>
      <a href="/products" className="text-white d-block mb-3">Produits</a>
      <a href="/orders" className="text-white d-block mb-3">Commandes</a>
      <a href="/users" className="text-white d-block mb-3">Utilisateurs</a>
    </div>
  );
}
