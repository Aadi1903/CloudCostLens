import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoImage from '../assets/logo.png';

const Header = ({ theme, onToggleTheme }) => {
  return (
    <header className="header">
      <div className="container header-content">
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <img src={logoImage} alt="CloudCostLens Logo" style={{ height: '36px', width: 'auto', borderRadius: '4px' }} />
          <span className="logo">CloudCostLens</span>
        </Link>

        <nav className="nav">
          <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Home
          </NavLink>
          <NavLink to="/how-it-works" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            How It Works
          </NavLink>
          <NavLink to="/requirements" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Dashboard
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            History
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            About
          </NavLink>

          <button
            className="theme-toggle"
            onClick={onToggleTheme}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            aria-label="Toggle theme"
            style={{ width: '36px', height: '36px', padding: 0 }}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          <AuthStatus />
        </nav>
      </div>
    </header>
  );
};

const AuthStatus = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <Link to="/login" className="btn btn-primary btn-sm" style={{ padding: '0.5rem 1rem' }}>
        Login
      </Link>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '0.5rem' }}>
      <div style={{ textAlign: 'right', display: 'none', md: 'block' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
          {user.role === 'ROLE_ADMIN' ? 'ADMIN' : 'USER'}
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{user.username}</div>
      </div>
      <button 
        onClick={() => { logout(); navigate('/'); }} 
        className="btn btn-outline btn-sm"
        style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
      >
        Sign Out
      </button>
    </div>
  );
};

export default Header;
