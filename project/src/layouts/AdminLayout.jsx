import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, LogOut, LayoutDashboard, Users, MessageSquare, Menu, X, Info } from 'lucide-react';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false); // Nouvel état pour le modal
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    setLogoutModalOpen(true); // Ouvre le modal au lieu de window.confirm
  };

  const confirmLogout = async () => {
    try {
      await logout();
      setLogoutModalOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const cancelLogout = () => {
    setLogoutModalOpen(false);
  };

  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-gray-100 to-blue-50 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gradient-to-br from-blue-400/20 to-purple-400/20 dark:from-blue-800/20 dark:to-purple-800/20 blur-3xl rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gradient-to-br from-purple-400/20 to-pink-400/20 dark:from-purple-800/20 dark:to-pink-800/20 blur-3xl rounded-full animate-pulse" />
      </div>

      {/* Sidebar Mobile Toggle */}
      <div className="md:hidden fixed top-0 w-full z-50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 p-4 flex items-center justify-between">
        <Link to="/admin" className="text-xl font-bold flex items-center space-x-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
          <span>ClienTélia</span>
        </Link>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`w-full md:w-72 md:fixed md:top-0 md:h-screen bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg border-r border-gray-200/50 dark:border-gray-700/50 flex flex-col transition-all duration-300 ${
          isSidebarOpen ? 'flex' : 'hidden md:flex'
        }`}
      >
        <div className="p-6">
          <Link to="/admin" className="text-2xl font-bold flex items-center space-x-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
            <span>ClienTélia</span>
          </Link>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">Administration</div>
        </div>

        <nav className="flex-1 px-3 py-4">
          <div className="mb-6">
            <div className="mb-3 px-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Menu
            </div>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/admin"
                  className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActivePath('/admin') &&
                    !isActivePath('/admin/demandes') &&
                    !isActivePath('/admin/profil') &&
                    !isActivePath('/admin/satisfaction') &&
                    !isActivePath('/admin/users')
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <LayoutDashboard size={18} className="mr-3" />
                  Tableau de bord
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/users"
                  className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActivePath('/admin/users')
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <Users size={18} className="mr-3" />
                  Utilisateurs
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/demandes"
                  className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActivePath('/admin/demandes')
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <MessageSquare size={18} className="mr-3" />
                  Demandes
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/satisfaction"
                  className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActivePath('/admin/satisfaction')
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <MessageSquare size={18} className="mr-3" />
                  Satisfaction
                </Link>
              </li>
            </ul>
          </div>

          <div className="mb-6">
            <div className="mb-3 px-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Compte
            </div>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/admin/profil"
                  className={`flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                    isActivePath('/admin/profil')
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <Users size={18} className="mr-3" />
                  Profil
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        <div className="p-6 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center space-x-2">
            <Link
              to="/admin/about"
              className={`p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 ${
                isActivePath('/admin/about')
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                  : ''
              }`}
              onClick={() => setIsSidebarOpen(false)}
              aria-label="À propos de SatisGest"
            >
              <Info size={20} />
            </Link>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
              aria-label={darkMode ? 'Passer au mode clair' : 'Passer au mode sombre'}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-100/50 dark:hover:bg-red-900/50 rounded-lg"
              aria-label="Se déconnecter"
            >
              <LogOut size={16} className="mr-2" />
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen md:ml-72 pt-20 md:pt-0">
        <div className="container mx-auto px-6 py-8 flex-1">
          <Outlet />
        </div>
        <footer className="border-t border-gray-200/50 dark:border-gray-700/50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg py-4">
          <div className="container mx-auto px-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-sm">
              <p className="text-gray-500 dark:text-gray-400">
                © 2025 SatisGest. Tous droits réservés.
              </p>
              <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                <span className="font-medium">Admin:</span>
                <span className="text-gray-600 dark:text-gray-300">{user?.username || 'N/A'}</span>
              </div>
            </div>
          </div>
        </footer>
      </main>

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-80 border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Confirmer la déconnexion
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Êtes-vous sûr de vouloir vous déconnecter ?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                Annuler
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors duration-200"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;