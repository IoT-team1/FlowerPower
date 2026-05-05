import { calcStats } from '../../utils/stats';
import { getThresholdStyles } from '../../utils/thresholds';

function StatCard({ label, avg, min, max, unit, thresholdStyles }) {
  return (
    <div className="bg-gray-100 rounded-xl px-4 py-3">
      <div className="text-xs text-gray-400 mb-2">{label}</div>
      <div className={`text-2xl font-medium ${thresholdStyles.text}`}>
        {avg != null ? `${avg}${unit}` : '—'}
      </div>
      <div className="flex gap-3 mt-2">
        <span className="text-xs text-gray-400">
          min <span className="text-blue-500 font-medium">{min != null ? `${min}${unit}` : '—'}</span>
        </span>
        <span className="text-xs text-gray-400">
          max <span className="text-red-500 font-medium">{max != null ? `${max}${unit}` : '—'}</span>
        </span>
      </div>
      <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium ${thresholdStyles.badge}`}>
        {thresholdStyles.label}
      </span>
    </div>
  );
}

export default function StatsGrid({ measurements, thresholds = {} }) {
  const tempStats = calcStats(measurements, 'temperature');
  const humStats  = calcStats(measurements, 'humidity');

  const tempStyles = getThresholdStyles(tempStats.avg, thresholds.minTemp, thresholds.maxTemp);
  const humStyles  = getThresholdStyles(humStats.avg, thresholds.minHum, thresholds.maxHum);

  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      <StatCard
        label="Teplota – průměr 24h"
        unit="°C"
        {...tempStats}
        thresholdStyles={tempStyles}
      />
      <StatCard
        label="Vlhkost půdy – průměr 24h"
        unit="%"
        {...humStats}
        thresholdStyles={humStyles}
      />
    </div>
  );
}