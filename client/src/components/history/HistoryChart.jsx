import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
} from 'recharts';
import { formatChartTime } from '../../utils/formatters';
const metrics = [
  { key: 'temperature', label: 'Teplota',      unit: '°C', color: '#134087' },
  { key: 'moisture',    label: 'Vlhkost půdy', unit: '%',  color: '#BA7517' },
  { key: 'humidity',    label: 'Vlhkost vzduchu', unit: '%',  color: '#085319' },

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
          <span className="text-gray-400">{p.dataKey === 'temperature' ? 'teplota' : p.dataKey === 'moisture' ? 'vlhkost půdy' : 'vlhkost vzduchu' }</span>
        </div>
      ))}
    </div>
  );
};

export default function HistoryChart({ measurements, thresholds = {}, range = '24h' }) {
  const chartData = measurements
  console.log('chartData:', chartData);
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
                dataKey="label"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={true}
                interval={range === '30d' ? 4 : 'preserveStartEnd'}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              {/*
              {thresholds.minTemp != null && (
                <ReferenceLine y={thresholds.minTemp} stroke="#134087" strokeDasharray="4 3" strokeWidth={1} />
              )}
              {thresholds.maxTemp != null && (
                <ReferenceLine y={thresholds.maxTemp} stroke="#134087" strokeDasharray="4 3" strokeWidth={1} />
              )}
              {thresholds.minHum != null && (
                <ReferenceLine y={thresholds.minHum} stroke="#BA7517" strokeDasharray="4 3" strokeWidth={1} />
              )}
              {thresholds.maxHum != null && (
                <ReferenceLine y={thresholds.maxHum} stroke="#BA7517" strokeDasharray="4 3" strokeWidth={1} />
              )}
              */}
              <Line type="monotone" dataKey="temperature" stroke="#134087" strokeWidth={1.5} dot={ { r: 2, fill: "#134087"}} activeDot={{ r: 3 }}                connectNulls={false}/>
              <Line type="monotone" dataKey="moisture"    stroke="#BA7517" strokeWidth={1.5} dot={ { r: 2, fill: "#BA7517"}} activeDot={{ r: 3 }}               connectNulls={false} />
              <Line type="monotone" dataKey="humidity"    stroke="#085319" strokeWidth={1.5} dot={ { r: 2, fill: "#085319"}} activeDot={{ r: 3 }}               connectNulls={false} />
            </LineChart>
          </ResponsiveContainer>
          {/*}
          <div className="flex gap-4 mt-2 justify-end flex-wrap">
            {thresholds.minTemp != null && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <span className="inline-block w-4 border-t border-dashed border-b-blue-900" />
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
          */}
        </>
      )}
    </div>
  );
}