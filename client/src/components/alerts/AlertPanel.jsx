import { useState } from 'react';
import { formatRelativeTime } from '../../utils/formatters';

export default function AlertPanel({ onClose, alerts, resolve }) {
  const [filter, setFilter] = useState('all');

  const filtered = [...alerts]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .filter((a) => {
      if (filter === 'unresolved') return !a.isResolved;
      if (filter === 'resolved')   return a.isResolved;
      return true;
    });

  return (
    <div className="absolute right-0 top-12 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden ring-1 ring-black/5">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
        <span className="text-sm font-bold text-gray-900">Notifikace</span>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-2xl leading-none cursor-pointer"
        >
          ×
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 px-3 py-2 border-b border-gray-100 bg-white">
        {[
          { key: 'all',        label: 'Vše' },
          { key: 'unresolved', label: 'Aktivní' },
          { key: 'resolved',   label: 'Historie' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`text-[11px] px-3 py-1 rounded-full border transition-all cursor-pointer ${
              filter === f.key
                ? 'bg-amber-600 text-white border-amber-600 font-bold shadow-sm'
                : 'border-transparent text-gray-500 hover:bg-gray-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List of Notifications */}
      <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
        {filtered.length === 0 ? (
          <div className="text-sm text-gray-400 text-center py-10 font-medium">Žádné notifikace.</div>
        ) : (
          filtered.map((alert) => (
            <div key={alert._id} className={`px-4 py-4 ${!alert.isResolved ? 'bg-amber-50/20' : 'bg-white'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    alert.isResolved ? 'bg-green-500' : 'bg-amber-500 animate-pulse'
                  }`} />
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-gray-900 uppercase">
                      {typeof alert.plantId === 'object' ? alert.plantId?.name : alert.plantName ?? 'Rostlina'}
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5 leading-snug">{alert.message}</div>
                    
                    {/* Recommendation Tip display */}
                    {alert.recommendation && (
                      <div className="text-[10px] text-amber-800 mt-1.5 leading-tight  bg-amber-50 rounded px-2 py-1 border border-amber-100/50">
                        Tip: {alert.recommendation}
                      </div>
                    )}

                    <div className="text-[10px] text-gray-400 mt-2 font-medium">
                      {formatRelativeTime(alert.timestamp)}
                    </div>
                  </div>
                </div>
                {!alert.isResolved && (
                  <button
                    onClick={() => resolve(alert._id) }
                    className="text-[10px] font-bold text-green-700 hover:text-green-900 px-2 py-1 bg-green-50 rounded-xl cursor-pointer transition-colors"
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