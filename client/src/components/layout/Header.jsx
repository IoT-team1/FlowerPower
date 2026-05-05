import { NavLink } from 'react-router-dom';

export default function Header() {
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
        {/* sem přidat alert bell */}
        <div className="w-8 h-8 rounded-full bg-green-50 border border-gray-200 flex items-center justify-center text-xs font-medium text-green-700 cursor-pointer">
          JP
        </div>
      </div>

    </header>
  );
}