import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const API = import.meta.env.VITE_API_URL || "http://localhost:3001";

function App() {
  const [readings, setReadings] = useState([]);
  const [gateways, setGateways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [r, g] = await Promise.all([
          axios.get(`${API}/measurements`),
          axios.get(`${API}/gateways`),
        ]);
        setReadings(r.data.reverse());
        setGateways(g.data);
      } catch (err) {
        setError("Could not connect to API");
      } finally {
        setLoading(false);
      }
    };
    fetch();
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, []);

  const latest = readings[readings.length - 1];

  if (loading) return <div style={styles.center}>Loading...</div>;
  if (error) return <div style={styles.center}>{error}</div>;

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Flower Power</h1>

      <div style={styles.cards}>
        <div style={styles.card}>
          <div style={styles.label}>Temperature</div>
          <div style={styles.value}>
            {latest ? `${latest.temperature}°C` : "—"}
          </div>
        </div>
        <div style={styles.card}>
          <div style={styles.label}>Humidity</div>
          <div style={styles.value}>{latest ? `${latest.humidity}%` : "—"}</div>
        </div>
        <div style={styles.card}>
          <div style={styles.label}>Gateways</div>
          <div style={styles.value}>{gateways.length}</div>
        </div>
        <div style={styles.card}>
          <div style={styles.label}>Readings</div>
          <div style={styles.value}>{readings.length}</div>
        </div>
      </div>

      <div style={styles.chart}>
        <h2 style={styles.subtitle}>Last 50 readings</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={readings}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(v) => new Date(v).toLocaleTimeString()}
            />
            <YAxis yAxisId="left" domain={["auto", "auto"]} />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={["auto", "auto"]}
            />
            <Tooltip labelFormatter={(v) => new Date(v).toLocaleString()} />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="temperature"
              stroke="#e07b39"
              name="Temp (°C)"
              dot={false}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="humidity"
              stroke="#4a90d9"
              name="Humidity (%)"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={styles.chart}>
        <h2 style={styles.subtitle}>Gateways</h2>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Status</th>
              <th>Last Sync</th>
            </tr>
          </thead>
          <tbody>
            {gateways.map((g) => (
              <tr key={g._id}>
                <td>{g._id}</td>
                <td>{g.name}</td>
                <td>{g.status}</td>
                <td>{g.lastSync ? new Date(g.lastSync).toLocaleString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  page: {
    maxWidth: 900,
    margin: "0 auto",
    padding: "2rem",
    fontFamily: "sans-serif",
  },
  title: { fontSize: "2rem", marginBottom: "1.5rem" },
  subtitle: { fontSize: "1.2rem", marginBottom: "1rem" },
  center: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  },
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "1rem",
    marginBottom: "2rem",
  },
  card: {
    background: "#f5f5f5",
    borderRadius: 8,
    padding: "1.5rem",
    textAlign: "center",
  },
  label: { fontSize: "0.85rem", color: "#666", marginBottom: 8 },
  value: { fontSize: "2rem", fontWeight: "bold", color: "#333" },
  chart: {
    background: "#f5f5f5",
    borderRadius: 8,
    padding: "1.5rem",
    marginBottom: "1.5rem",
  },
  table: { width: "100%", borderCollapse: "collapse" },
};

export default App;
