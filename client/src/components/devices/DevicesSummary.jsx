export default function DevicesSummary({ devices }) {
  const total   = devices.length;
  const online  = devices.filter((d) => d.status === 'online').length;
  const warning = devices.filter((d) => d.status === 'warning').length;
  const offline = devices.filter((d) => d.status === 'offline').length;

  const tiles = [
    { label: 'Celkem zařízení', value: total,   valueClass: 'text-gray-900' },
    { label: 'Online',          value: online,   valueClass: 'text-green-700' },
    { label: 'Upozornění',      value: warning,  valueClass: 'text-amber-700' },
    { label: 'Offline',         value: offline,  valueClass: 'text-gray-400' },
  ];

  return (
    <div className="grid grid-cols-4 gap-3 mb-6">
      {tiles.map((tile) => (
        <div key={tile.label} className="bg-gray-100 rounded-xl px-4 py-3">
          <div className="text-xs text-gray-400 mb-1">{tile.label}</div>
          <div className={`text-2xl font-medium ${tile.valueClass}`}>{tile.value}</div>
        </div>
      ))}
    </div>
  );
}