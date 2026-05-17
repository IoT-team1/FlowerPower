import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAlertStore } from '../../store/alerts.store';
import AlertPanel from '../alerts/AlertPanel';
import { useAlerts } from '../../hooks/useAlerts';

export default function Header() {
  const unreadCount = useAlertStore((s) => s.unreadCount);
  const [panelOpen, setPanelOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { alerts, resolve } = useAlerts();

  const navLinks = [
    { to: '/devices', label: 'Přehled zařízení' },
    { to: '/history', label: 'Historie' },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="h-14 px-6 flex items-center">

        {/* logo */}
        <div className="flex-1 flex items-center gap-2.5">
          <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 22V12M12 12C12 12 7 8.5 5 4c3.5 0 6.5 2.5 7 8zM12 12C12 12 17 8.5 19 4c-3.5 0-6.5 2.5-7 8z"
                    stroke="#3B6D11" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 12C12 12 9 15 9 18c0 1.66 1.34 3 3 3s3-1.34 3-3c0-3-3-6-3-6z"
                    stroke="#3B6D11" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-base font-medium text-gray-900">
            Flower<span className="text-green-700">Power</span>
          </span>
        </div>

        {/* desktop nav */}
        <nav className="hidden sm:flex items-center gap-3 mr-13" >
          {navLinks.map(({ to, label }) => (
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

        {/* Right side */}
        <div className="flex-1 flex items-center justify-end gap-2">
          {/* Bell */}
          <div className="relative">
            <button
              onClick={() => setPanelOpen((o) => !o)}
              className="w-8 h-8 rounded-lg cursor-pointer border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors relative"
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
              <AlertPanel alerts={alerts} resolve={resolve} onClose={() => setPanelOpen(false)} />
            )}
          </div>

          {/* Avatar – desktop only */}
          <div className="hidden sm:flex w-8 h-8 rounded-full bg-green-50 border border-gray-200 items-center justify-center text-xs font-medium text-green-700 cursor-pointer">
            JP
          </div>

          {/* Hamburger – mobile only */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="sm:hidden w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            {menuOpen ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M3 12h18M3 6h18M3 18h18"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="sm:hidden border-t border-gray-100 px-4 py-3 flex flex-col gap-1">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `text-sm px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-gray-100 text-gray-900 font-medium'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
          <div className="flex items-center gap-2 px-3 py-2 mt-1 border-t border-gray-100 pt-3">
            <div className="w-7 h-7 rounded-full bg-green-50 border border-gray-200 flex items-center justify-center text-xs font-medium text-green-700">
              JP
            </div>
            <span className="text-sm text-gray-500">Uživatel</span>
          </div>
        </div>
      )}
    </header>
  );
}