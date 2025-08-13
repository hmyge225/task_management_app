import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">TM</div>
      <nav className="sidebar-nav">
        <NavLink end to="/" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
          <span className="dot" /> Tâches
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
          <span className="dot" /> Profil
        </NavLink>
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-card">
          <div className="sidebar-card-title">Bon retour 👋</div>
          <div className="sidebar-card-sub">Organise tes tâches</div>
        </div>
      </div>
    </aside>
  );
}


