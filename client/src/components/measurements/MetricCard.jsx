export default function MetricCard({ label, value, unit }) {
  return (
    <div>
      <div>{label}</div>
      <div>
        {value != null ? `${value}${unit}` : '—'}
      </div>
    </div>
  );
}