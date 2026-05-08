import { useEffect, useState } from 'react';
import { useAlertStore } from '../../store/alerts.store';

function ToastItem({ alert, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 6000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm w-80">
      <div className="w-1 self-stretch rounded-full bg-amber-600 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900">{alert.plantName}</div>
        <div className="text-xs text-gray-400 mt-0.5">{alert.message}</div>
      </div>
      <button
        onClick={onClose}
        className="text-gray-300 hover:text-gray-500 text-lg leading-none flex-shrink-0"
      >
        ×
      </button>
    </div>
  );
}

export default function Toast() {
  const alerts = useAlertStore((s) => s.alerts);
  const [visible, setVisible] = useState([]);

  useEffect(() => {
    const latest = alerts[0];
    if (!latest || visible.find((v) => v._id === latest.alertId)) return;
    const toastAlert = { ...latest, _id: latest.alertId };
    setVisible((prev) => [toastAlert, ...prev].slice(0, 3));
  }, [alerts]);

  const remove = (id) => setVisible((prev) => prev.filter((v) => v._id !== id));

  if (!visible.length) return null;

  return (
    <div className="fixed bottom-5 right-5 flex flex-col gap-2 z-50">
      {visible.map((alert) => (
        <ToastItem key={alert._id} alert={alert} onClose={() => remove(alert._id)} />
      ))}
    </div>
  );
}