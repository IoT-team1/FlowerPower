import { calcStats } from '../../utils/stats';

function StatTile({ label, avg, min, max, unit }) {
  return (
    <div className="bg-gray-100 rounded-xl px-4 py-3">
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className="text-2xl font-medium text-gray-900">
        {avg != null ? `${avg}${unit}` : '—'}
      </div>
      <div className="flex gap-3 mt-2">
        <span className="text-xs text-gray-400">
          min <span className="text-gray-900" >{min != null ? `${min}${unit}` : '—'}</span>
        </span>
        <span className="text-xs text-gray-400">
          max <span className="text-gray-900 font-medium">{max != null ? `${max}${unit}` : '—'}</span>
        </span>
      </div>
    </div>
  );
}

export default function HistoryStatsGrid({ measurements }) {
  const tempStats = calcStats(measurements, 'temperature');
  const humStats  = calcStats(measurements, 'humidity');
  const moistStats = calcStats(measurements, 'moisture');

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      <StatTile label="Průměrná teplota"      unit="°C" {...tempStats} />
      <StatTile label="Průměrná vlhkost půdy" unit="%"  {...moistStats} />
      <StatTile label="Průměrná vlhkost vzduchu" unit="%"  {...humStats} />
      <div className="bg-gray-100 rounded-xl px-4 py-3">
        <div className="text-xs text-gray-400 mb-1">Počet měření</div>
        <div className="text-2xl font-medium text-gray-900">{measurements.length}</div>
        <div className="text-xs text-gray-400 mt-2">za vybrané období</div>
      </div>
    </div>
  );
}