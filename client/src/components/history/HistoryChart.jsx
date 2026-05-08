import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
} from 'recharts';
import { formatChartTime } from '../../utils/formatters';

const metrics = [
  { key: 'temperature', label: 'Teplota',      unit: '°C', color: '#378ADD' },
  { key: 'humidity',    label: 'Vlhkost půdy', unit: '%',  color: '#BA7517' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs shadow-sm">
      <div className="text-gray-400 mb-1">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
          <span className="text-gray-900 font-medium">{p.value}{p.dataKey === 'temperature' ? '°C' : '%'}</span>
          <span className="text-gray-400">{p.dataKey === 'temperature' ? 'teplota' : 'vlhkost půdy'}</span>
        </div>
      ))}
    </div>
  );
};

export default function HistoryChart({ measurements, thresholds = {} }) {
  const chartData = [...measurements]
    .reverse()
    .map((m) => ({
      time:        formatChartTime(m.timestamp),
      temperature: m.temperature,
      humidity:    m.humidity,
    }));

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-900">Vývoj hodnot</span>
        <div className="flex items-center gap-4">
          {metrics.map((m) => (
            <span key={m.key} className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="w-3 h-0.5 inline-block rounded" style={{ background: m.color }} />
              {m.label}
            </span>
          ))}
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-sm text-gray-400">
          Žádná data pro vybrané období.
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />

              {thresholds.minTemp != null && (
                <ReferenceLine y={thresholds.minTemp} stroke="#378ADD" strokeDasharray="4 3" strokeWidth={1} />
              )}
              {thresholds.maxTemp != null && (
                <ReferenceLine y={thresholds.maxTemp} stroke="#378ADD" strokeDasharray="4 3" strokeWidth={1} />
              )}
              {thresholds.minHum != null && (
                <ReferenceLine y={thresholds.minHum} stroke="#BA7517" strokeDasharray="4 3" strokeWidth={1} />
              )}
              {thresholds.maxHum != null && (
                <ReferenceLine y={thresholds.maxHum} stroke="#BA7517" strokeDasharray="4 3" strokeWidth={1} />
              )}

              <Line type="monotone" dataKey="temperature" stroke="#378ADD" strokeWidth={1.5} dot={false} activeDot={{ r: 3 }} />
              <Line type="monotone" dataKey="humidity"    stroke="#BA7517" strokeWidth={1.5} dot={false} activeDot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>

          <div className="flex gap-4 mt-2 justify-end flex-wrap">
            {thresholds.minTemp != null && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <span className="inline-block w-4 border-t border-dashed border-blue-500" />
                min/max teplota
              </span>
            )}
            {thresholds.minHum != null && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <span className="inline-block w-4 border-t border-dashed border-amber-600" />
                min/max vlhkost
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}