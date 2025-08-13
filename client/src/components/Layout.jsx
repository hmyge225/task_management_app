import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserInfo from './UserInfo';
import { AnimatePresence, motion } from 'framer-motion';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isActive = (path) => (location.pathname === path ? 'active' : '');

  return (
    <>
      <header className="appbar appbar--minimal">
        <div className="container appbar-inner">
          <Link to="/" className="brand">Task Manager</Link>
          <nav className="nav nav--minimal">
            <Link className={isActive('/')} to="/">Tâches</Link>
            <Link className={isActive('/profile')} to="/profile">Profil</Link>
          </nav>
          <UserInfo user={user} onLogout={logout} />
        </div>
      </header>
      <main className="container">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </>
  );
}


