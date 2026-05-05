const ranges = [
  { key: '24h', label: '24 h' },
  { key: '7d',  label: '7 dní' },
  { key: '30d', label: '30 dní' },
];

export default function RangeSelector({ value, onChange }) {
  return (
    <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
      {ranges.map((r) => (
        <button
          key={r.key}
          onClick={() => onChange(r.key)}
          className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
            value === r.key
              ? 'bg-white text-gray-900 font-medium shadow-sm'
              : 'text-gray-400 hover:text-gray-900'
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}