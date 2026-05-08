import {
  ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Cell
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs shadow-sm">
      <div className="text-gray-400 mb-1">{label}</div>
      <div className="font-medium text-gray-900">{payload[0].value} alertů</div>
    </div>
  );
};

const groupByDay = (alerts) => {
  const map = {};
  alerts.forEach((a) => {
    const day = new Date(a.timestamp).toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'numeric',
    });
    map[day] = (map[day] ?? 0) + 1;
  });
  return Object.entries(map)
    .map(([date, count]) => ({ date, count }))
    .reverse();
};

export default function AlertsChart({ alerts }) {
  const data = groupByDay(alerts);

  if (!data.length) return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 flex items-center justify-center h-48 text-sm text-gray-400">
      Žádné alerty za vybrané období.
    </div>
  );

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-900">Alerty podle dne</span>
        <span className="text-xs text-gray-400">{alerts.length} celkem</span>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill="#FAEEDA" stroke="#BA7517" strokeWidth={0.5} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}