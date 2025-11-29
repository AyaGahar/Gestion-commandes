export default function StatsCards({ stats }) {
  if (!stats) return <p>Chargement...</p>;

  const totalRevenue = Number(stats.totalRevenue )|| 0; // valeur par défaut 0

  return (
    <div className="row mt-4">
      {/* Total Produits */}
      <div className="col-md-3 mb-3">
        <div className="card bg-primary text-white">
          <div className="card-body">
            <h5>Produits</h5>
            <h2>{stats.totalProducts}</h2>
          </div>
        </div>
      </div>

      {/* Total Utilisateurs */}
      <div className="col-md-3 mb-3">
        <div className="card bg-success text-white">
          <div className="card-body">
            <h5>Utilisateurs</h5>
            <h2>{stats.totalUsers}</h2>
          </div>
        </div>
      </div>

      {/* Total Commandes */}
      <div className="col-md-3 mb-3">
        <div className="card bg-warning text-white">
          <div className="card-body">
            <h5>Commandes</h5>
            <h2>{stats.totalOrders}</h2>
          </div>
        </div>
      </div>

      {/* Total Chiffre d’affaires */}
      <div className="col-md-3 mb-3">
        <div className="card bg-info text-white">
          <div className="card-body">
            <h5>Chiffre d’affaires</h5>
            <h2>{totalRevenue.toFixed(2)} TND</h2>
          </div>
        </div>
      </div>

      {/* Produits en rupture ou faibles stocks */}
      <div className="col-12 mt-3">
        <div className="card border-danger">
          <div className="card-body">
            <h5 className="text-danger">Produits en rupture / faible stock</h5>
            {stats.lowStockCount === 0 ? (
              <p>Rien à signaler</p>
            ) : (
              <ul>
                {stats.lowStockProducts.map(p => (
                  <li key={p.id}>
                    {p.name} – {p.quantity} restant
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
