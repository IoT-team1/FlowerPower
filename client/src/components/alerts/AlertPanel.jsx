import { useState } from 'react';
import { formatRelativeTime } from '../../utils/formatters';

export default function AlertPanel({ onClose, alerts, resolve }) {
  const [filter, setFilter] = useState('all');

  console.log('alerts:', alerts);

  const filtered = [...alerts]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .filter((a) => {
      if (filter === 'unresolved') return !a.isResolved;
      if (filter === 'resolved')   return a.isResolved;
      return true;
    });


  return (
    <div className="absolute right-0 top-10 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <span className="text-sm font-medium text-gray-900">Notifikace</span>
        <button
          onClick={onClose}
          className="text-gray-300 hover:text-gray-500 text-lg leading-none"
        >
          ×
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-1 px-3 py-2 border-b border-gray-100">
        {[
          { key: 'all',        label: 'Vše' },
          { key: 'unresolved', label: 'Aktivní' },
          { key: 'resolved',   label: 'Vyřešené' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
              filter === f.key
                ? 'bg-gray-100 text-gray-900 border-gray-200 font-medium'
                : 'border-transparent text-gray-400 hover:text-gray-900'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
        {filtered.length === 0 ? (
          <div className="text-sm text-gray-400 text-center py-8">Žádné notifikace.</div>
        ) : (
          filtered.map((alert) => (
            <div key={alert._id} className={`px-4 py-3 ${!alert.isResolved ? 'bg-amber-50/40' : ''}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                    alert.isResolved ? 'bg-green-600' : 'bg-amber-600'
                  }`} />
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-gray-900">
                      {typeof alert.plantId === 'object' ? alert.plantId?.name : alert.plantName ?? '—'}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">{alert.message}</div>
                    <div className="text-xs text-gray-300 mt-1">
                      {formatRelativeTime(alert.timestamp)}
                    </div>
                  </div>
                </div>
                {!alert.isResolved && (
                  <button
                    onClick={() => resolve(alert._id) }
                    className="text-xs text-green-700 hover:text-green-900 flex-shrink-0 mt-0.5 cursor-pointer"
                  >
                    Vyřešit
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}