import { NavLink } from 'react-router-dom';

export default function Header() {
  return (
    <header>
      <div className="logo">
        <span>Flower</span><span>Power</span>
      </div>

      <nav>
        <NavLink to="/devices">Přehled zařízení</NavLink>
        {/* Uncomment when other pages are implemented

        <NavLink to="/history">Historie</NavLink>
        <NavLink to="/settings">Nastavení</NavLink>
        */}
      </nav>

      <div className="header-right">
        {/* sem přijde AlertPanel */}
        <div className="avatar">JP</div>
      </div>
    </header>
  );
}