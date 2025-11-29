import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

export default function SalesChart() {
  const data = {
    labels: ["Jan", "Fév", "Mar", "Avr", "Mai"],
    datasets: [
      {
        label: "Commandes par mois",
        data: [5, 8, 12, 4, 15],
        borderColor: "blue",
        tension: 0.3
      }
    ]
  };

  return (
    <div className="card p-3 mt-4">
      <h3>Évolution des ventes</h3>
      <Line data={data} />
    </div>
  );
}
