import { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { formatChartTime } from '../../utils/formatters';

const tabs = [
  { key: 'temperature', label: 'Teplota',      unit: '°C', color: '#134087' },
  { key: 'moisture',    label: 'Vlhkost půdy', unit: '%',  color: '#BA7517' },
  { key: 'humidity',    label: 'Vlhkost vzduchu', unit: '%',  color: '#085319' },

];

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs shadow-sm">
      <div className="text-gray-400 mb-1">{label}</div>
      <div className="font-medium text-gray-900">{payload[0].value}{unit}</div>
    </div>
  );
};

export default function MetricChart({ measurements, thresholds = {} }) {
  const [activeTab, setActiveTab] = useState('temperature');

  const tab = tabs.find((t) => t.key === activeTab);

  const chartData = measurements
    .slice(0,10)
    .reverse()
    .map((m) => ({
      time: formatChartTime(m.timestamp),
      value: m[activeTab],
    }));

  console.log("chartData", chartData)
  const minThreshold =
    activeTab === 'temperature'
      ? thresholds.minTemp
      : activeTab === 'humidity'
        ? thresholds.minHum
        : activeTab === 'moisture'
          ? thresholds.minMoist
          : null;
  const maxThreshold =
    activeTab === 'temperature'
      ? thresholds.maxTemp
      : activeTab === 'humidity'
        ? thresholds.maxHum
        : activeTab === 'moisture'
          ? thresholds.maxMoist
          : null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-900">Vývoj hodnot</span>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
                activeTab === t.key
                  ? 'bg-white text-gray-900 font-medium shadow-sm cursor-pointer'
                  : 'text-gray-400 hover:text-gray-900 cursor-pointer'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-sm text-gray-400">
          Žádná data k zobrazení.
        </div>
      ) : (
      <ResponsiveContainer width="100%" height={200}>
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
          <Tooltip content={<CustomTooltip unit={tab.unit} />} />

          {minThreshold != null && (
            <ReferenceLine
              y={minThreshold}
              stroke="#888780"
              strokeDasharray="4 3"
              strokeWidth={1}
            />
          )}
          {maxThreshold != null && (
            <ReferenceLine
              y={maxThreshold}
              stroke="#E24B4A"
              strokeDasharray="4 3"
              strokeWidth={1}
            />
          )}

          <Line
            type="monotone"
            dataKey="value"
            stroke={tab.color}
            strokeWidth={1.5}
            dot={ { r: 2, fill: "#134087"}}
            activeDot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
      )}

      {(minThreshold != null || maxThreshold != null) && (
        <div className="flex gap-4 mt-2 justify-end">
          {minThreshold != null && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <span className="inline-block w-4 border-t border-dashed border-gray-400" />
              min {minThreshold}{tab.unit}
            </span>
          )}
          {maxThreshold != null && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <span className="inline-block w-4 border-t border-dashed border-red-500" />
              max {maxThreshold}{tab.unit}
            </span>
          )}
        </div>
      )}
    </div>
  );
}