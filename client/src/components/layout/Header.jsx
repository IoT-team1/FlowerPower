import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAlerts } from "../../hooks/useAlerts.js";
import AlertPanel from '../alerts/AlertPanel';
export default function Header() {
  const [panelOpen, setPanelOpen] = useState(false);
  const { alerts, unreadCount, resolve } = useAlerts();

  return (
    <header className="h-14 px-6 bg-white border-b border-gray-200 flex items-center justify-between sticky top-0 z-50">

      <div className="flex-1 flex items-center gap-2.5">
        <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"> <path d="M12 22V12M12 12C12 12 7 8.5 5 4c3.5 0 6.5 2.5 7 8zM12 12C12 12 17 8.5 19 4c-3.5 0-6.5 2.5-7 8z" stroke="#3B6D11" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/> <path d="M12 12C12 12 9 15 9 18c0 1.66 1.34 3 3 3s3-1.34 3-3c0-3-3-6-3-6z" stroke="#3B6D11" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/> </svg>
        </div>
        <span className="text-base font-medium text-gray-900 cursor-default">
          Flower<span className="text-green-700">Power</span>
        </span>
      </div>

      <nav className="flex items-center gap-1">
        {[
          { to: '/devices', label: 'Přehled zařízení' },
          { to: '/history', label: 'Historie měření' },
        ].map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `text-sm px-3 py-1.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-gray-100 text-gray-900 font-medium'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="flex-1 flex items-center justify-end gap-2">
        {/* Alert Bell */}
        <div className="relative">
          <button
            onClick={() => setPanelOpen((o) => !o)}
            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center cursor-pointer justify-center hover:bg-gray-100 transition-colors relative"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {panelOpen && (
            <AlertPanel alerts = {alerts} resolve = {resolve} onClose={() => setPanelOpen(false)} />
          )}
        </div>
        <div className="w-8 h-8 rounded-full bg-green-50 border border-gray-200 flex items-center justify-center text-xs font-medium text-green-700 cursor-pointer">
          JP
        </div>
      </div>

    </header>
  );
}