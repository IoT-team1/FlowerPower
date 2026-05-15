import { useEffect, useState } from 'react';
import {useAlerts} from "../../hooks/useAlerts.js";

function ToastItem({ alert, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 8000); // Extended time to read the recommendation
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl px-4 py-4 shadow-lg w-80 animate-in slide-in-from-right-5">
      <div className="w-1.5 self-stretch rounded-full bg-amber-600 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-gray-900">{alert.plantName}</div>
        <div className="text-xs text-gray-500 mt-1">{alert.message}</div>
        
        {/* New recommendation block for the user */}
        {alert.recommendation && (
          <div className="mt-3 p-2 bg-amber-50 text-amber-900 text-[11px] rounded-lg border border-amber-100 font-medium italic">
            💡 {alert.recommendation}
          </div>
        )}
      </div>
      <button
        onClick={onClose}
        className="text-gray-300 hover:text-gray-500 text-2xl leading-none flex-shrink-0 cursor-pointer"
      >
        ×
      </button>
    </div>
  );
}

export default function Toast() {
  const {alerts} = useAlerts()
  const [visible, setVisible] = useState([]);

  useEffect(() => {
    const latest = alerts[0];
    if (!latest) return;
    const id = latest.alertId || latest._id;
    setVisible((prev) => {
      if (prev.find((v) => v._id === id)) return prev;
      return [{ ...latest, _id: id }, ...prev].slice(0, 2);
    });
  }, [alerts]);

  const remove = (id) => setVisible((prev) => prev.filter((v) => v._id !== id));

  if (!visible.length) return null;

  return (
    <div className="fixed bottom-5 right-5 flex flex-col gap-3 z-50">
      {visible.map((alert) => (
        <ToastItem key={alert._id} alert={alert} onClose={() => remove(alert._id)} />
      ))}
    </div>
  );
}