import { formatDateTime } from '../../utils/formatters';
import { getThresholdStyles } from '../../utils/thresholds';

export default function MeasurementTable({ measurements, thresholds = {} }) {
  if (!measurements.length) return (
    <div className="text-sm text-gray-400 py-6 text-center">Žádná měření.</div>
  );
  console.log(measurements);
  console.log(thresholds);
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
        <tr className="border-b border-gray-100">
          <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Datum</th>
          <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Teplota</th>
          <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Vlhkost půdy</th>
        </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
        {measurements.map((m) => {
          const tempStyles = getThresholdStyles(m.temperature, thresholds.minTemp, thresholds.maxTemp);
          const humStyles  = getThresholdStyles(m.humidity, thresholds.minHum, thresholds.maxHum);

          return (
            <tr key={m._id} className="hover:bg-gray-50 transition-colors">
              <td className="px-5 py-3 text-gray-400">{formatDateTime(m.timestamp)}</td>
              <td className={`px-5 py-3 font-medium ${tempStyles.text}`}>{m.temperature}°C</td>
              <td className={`px-5 py-3 font-medium ${humStyles.text}`}>{m.humidity}%</td>
            </tr>
          );
        })}
        </tbody>
      </table>
    </div>
  );
}