import { formatValue } from '../../utils/formatters';
import { getThresholdStyles } from '../../utils/thresholds';

export default function MetricCard({ label, value, unit, min, max }) {
  const styles = getThresholdStyles(value, min, max);

  return (
    <div className="bg-gray-100 rounded-xl px-4 py-3">
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className={`text-xl font-medium ${styles.text}`}>
        {formatValue(value, unit)}
      </div>
      <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium ${styles.badge}`}>
        {styles.label}
      </span>
    </div>
  );
}