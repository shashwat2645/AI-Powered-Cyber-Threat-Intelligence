import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user && location.pathname === '/login') {
    return null;
  }

  const navLinks = [
    { path: '/', label: 'Dashboard' },
    { path: '/scanner', label: 'Scanner' },
    { path: '/threats', label: 'Threat Logs' },
    { path: '/anomalies', label: 'Anomalies' }
  ];

  return (
    <nav className="bg-primary text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold">
              ThreatIntel
            </Link>
            <div className="hidden md:flex space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? 'bg-slate-700 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="text-gray-300">{user?.username || user?.email}</span>
              <span className="ml-2 px-2 py-1 bg-slate-600 rounded text-xs">
                {user?.role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-2 text-sm bg-slate-700 hover:bg-slate-600 rounded transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;