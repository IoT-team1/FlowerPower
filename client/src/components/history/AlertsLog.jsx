import { formatDateTime, formatRelativeTime } from '../../utils/formatters';

const typeConfig = {
  warning: { dot: 'bg-amber-600', badge: 'bg-amber-50 text-amber-900', label: 'varování' },
  info:    { dot: 'bg-blue-500',  badge: 'bg-blue-50 text-blue-900',   label: 'info' },
};

export default function AlertsLog({ alerts }) {


  if (!alerts.length) return (
    <div className="bg-white border border-gray-200 rounded-xl px-5 py-8 text-sm text-gray-400 text-center">
      Žádné alerty za vybrané období.
    </div>
  );

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="max-h-[440px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-white">
          <tr className="border-b border-gray-100">
            <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Čas</th>
            <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Zpráva</th>
            <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Typ</th>
            <th className="text-left px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Stav</th>
            <th className="px-5 py-3" />
          </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
          {alerts.map((alert) => {
          const config = typeConfig[alert.level] ?? typeConfig.warning;
          return (
            <tr key={alert._id} className="hover:bg-gray-50 transition-colors">
              <td className="px-5 py-3 text-gray-900 whitespace-nowrap">
                <div>{formatDateTime(alert.timestamp)}</div>
                <div className="text-xs text-gray-300">{formatRelativeTime(alert.timestamp)}</div>
              </td>
              <td className="px-5 py-3 text-gray-900">{alert.message}</td>
              <td className="px-5 py-3">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${config.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                    {config.label}
                  </span>
              </td>
              <td className="px-5 py-3">
                {alert.isResolved ? (
                  <span className="text-xs text-green-700 font-medium">vyřešeno</span>
                ) : (
                  <span className="text-xs text-amber-700 font-medium">aktivní</span>
                )}
              </td>
            </tr>
          );
        })}
        </tbody>
      </table>
      </div>
    </div>
  );
}