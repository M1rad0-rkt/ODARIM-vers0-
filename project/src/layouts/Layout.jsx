import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Sun, Moon, ChevronDown, LogOut, User, Home, Menu, X, MessageSquare, Bell
} from 'lucide-react';
import { getNotifications, markNotificationAsRead, deleteNotification } from '../api/requests';
import { toast } from 'react-toastify';

const Layout = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  // Debug user.first_name
  useEffect(() => {
    console.log('User first_name:', user?.first_name);
  }, [user]);

  // Fetch notifications only if user is logged in
  useEffect(() => {
    if (user) {
      const fetchNotifications = async () => {
        try {
          const data = await getNotifications();
          setNotifications(data);
        } catch (error) {
          console.error('Erreur lors de la récupération des notifications:', error);
          toast.error('Impossible de charger les notifications');
        }
      };
      fetchNotifications();
    }
  }, [user]);

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.is_read) {
        await markNotificationAsRead(notification.id);
        setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      }
      if (!notification.request_id) {
        toast.error('Impossible de naviguer : ID de demande manquant');
        return;
      }
      navigate(`/client/details-demandes/${notification.request_id}`);
      setNotificationOpen(false);
    } catch (error) {
      console.error('Erreur lors du traitement de la notification:', error);
      toast.error('Erreur lors du traitement de la notification');
    }
  };

  // Handle notification deletion
  const handleDeleteNotification = async (notificationId, event) => {
    event.stopPropagation();
    try {
      await deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      toast.success('Notification supprimée');
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification:', error);
      toast.error('Erreur lors de la suppression de la notification');
    }
  };

  // Handle logout with confirmation
  const handleLogout = async () => {
    const confirmed = window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?');
    if (confirmed) {
      await logout();
      navigate('/');
    }
  };

  const renderLinks = () => {
    if (!user) return null;

    const commonProps = {
      className:
        'px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200 rounded-md hover:bg-gray-100/50 dark:hover:bg-gray-700/50',
    };

    return (
      <>
        {user.role === 'client' && (
          <>
            <Link to="/client/demandes" {...commonProps}>
              Mes demandes
            </Link>
          </>
        )}
        {user.role === 'admin' && (
          <>
            <Link to="/admin/demandes" {...commonProps}>
              Gestion demandes
            </Link>
            <Link to="/admin/satisfaction" {...commonProps}>
              Analyse satisfaction
            </Link>
          </>
        )}
      </>
    );
  };

  const renderMobileLinks = () => {
    if (!user) return null;

    const linkClasses =
      'px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors duration-200 flex items-center space-x-2';

    return (
      <>
        {user.role === 'client' && (
          <Link
            to="/client/demandes"
            className={linkClasses}
            onClick={() => setMobileMenuOpen(false)}
          >
            <MessageSquare size={16} />
            <span>Mes demandes</span>
          </Link>
        )}
        {user.role === 'admin' && (
          <>
            <Link
              to="/admin/demandes"
              className={linkClasses}
              onClick={() => setMobileMenuOpen(false)}
            >
              <MessageSquare size={16} />
              <span>Gestion demandes</span>
            </Link>
            <Link
              to="/admin/satisfaction"
              className={linkClasses}
              onClick={() => setMobileMenuOpen(false)}
            >
              <MessageSquare size={16} />
              <span>Analyse satisfaction</span>
            </Link>
          </>
        )}
      </>
    );
  };

  // Count unread notifications
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Determine display name and avatar initial
  const displayName = user?.first_name || '';
  const avatarInitial = user?.first_name?.charAt(0).toUpperCase() || '?';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-100 to-blue-50 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gradient-to-br from-blue-400/20 to-purple-400/20 dark:from-blue-800/20 dark:to-purple-800/20 blur-3xl rounded-full animate-float"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gradient-to-br from-purple-400/20 to-pink-400/20 dark:from-purple-800/20 dark:to-pink-800/20 blur-3xl rounded-full animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] bg-gradient-to-br from-blue-300/10 to-purple-300/10 dark:from-blue-900/10 dark:to-purple-900/10 blur rounded-full animate-pulse-slow"></div>
      </div>

      <header className="fixed top-0 w-full z-50 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-white dark:to-white"
            >
            SatisGest
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex space-x-4">
              <Link
                to="/"
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200 rounded-md hover:bg-gray-100/50 dark:hover:bg-gray-700/50 flex items-center space-x-2"
              >
                <Home size={16} />
                <span>Accueil</span>
              </Link>
              {renderLinks()}
            </nav>

            <div className="flex items-center space-x-4">
              {user && (
                <div className="relative">
                  <button
                    onClick={() => setNotificationOpen(!isNotificationOpen)}
                    className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors duration-200 relative"
                    aria-label="Notifications"
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  {isNotificationOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-lg border border-gray-200/50 dark:border-gray-700/50 shadow-lg z-10 max-h-96 overflow-y-auto">
                      <div className="p-4">
                        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200/50 dark:border-gray-700/50 pb-2 mb-3">
                          Notifications
                        </h3>
                        {notifications.length === 0 ? (
                          <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
                            Aucune notification
                          </p>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              className="relative mb-3 p-3 bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-700/50 rounded-md hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors duration-200 cursor-pointer"
                              onClick={() => handleNotificationClick(notif)}
                            >
                              <div className="flex items-start space-x-3">
                                {!notif.is_read && (
                                  <span className="mt-1.5 h-2 w-2 bg-blue-500 rounded-full flex-shrink-0" />
                                )}
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                    {notif.request_title}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {notif.message}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    {new Date(notif.created_at).toLocaleString('fr-FR')}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={(e) => handleDeleteNotification(notif.id, e)}
                                className="absolute top-2 right-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                                aria-label="Supprimer la notification"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                aria-label={darkMode ? 'Passer au mode clair' : 'Passer au mode sombre'}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                    aria-controls="profile-menu"
                    aria-expanded={isProfileMenuOpen}
                  >
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600 text-white flex items-center justify-center text-sm font-medium">
                      {avatarInitial}
                    </div>
                    <span className="text-sm font-medium hidden lg:inline">{displayName}</span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {isProfileMenuOpen && (
                    <div
                      id="profile-menu"
                      className="absolute right-0 mt-2 w-56 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-lg border border-gray-200/50 dark:border-gray-700/50 shadow-lg z-10"
                    >
                      <div className="p-3">
                        <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200/50 dark:border-gray-700/50 mb-2">
                          <span className="font-medium text-gray-700 dark:text-gray-300">{displayName}</span>
                          <br />
                          {user.email}
                        </div>
                        <Link
                          to={user.role === 'admin' ? '/admin/profil' : '/client/profil'}
                          className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 rounded-md transition-colors duration-200"
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          <User size={16} className="mr-2" />
                          Mon profil
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/50 rounded-md transition-colors duration-200"
                        >
                          <LogOut size={16} className="mr-2" />
                          Déconnexion
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex space-x-3">
                  <Link
                    to="/connexion"
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-600/50 rounded-md hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/inscription"
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-md hover:from-blue-600 hover:to-purple-600 transition-colors duration-200"
                  >
                    Inscription
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors duration-200"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden px-4 pb-4 pt-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border-t border-gray-200/50 dark:border-gray-700/50">
            <nav className="flex flex-col space-y-2">
              <Link
                to="/"
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors duration-200 flex items-center space-x-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home size={16} />
                <span>Accueil</span>
              </Link>
              {renderMobileLinks()}
              {user && (
                <div className="relative">
                  <button
                    onClick={() => setNotificationOpen(!isNotificationOpen)}
                    className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                    aria-label="Notifications"
                  >
                    <div className="flex items-center space-x-2">
                      <Bell size={16} />
                      <span>Notifications</span>
                    </div>
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  {isNotificationOpen && (
                    <div className="mt-2 w-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-lg border border-gray-200/50 dark:border-gray-700/50 shadow-lg max-h-96 overflow-y-auto">
                      <div className="p-4">
                        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200/50 dark:border-gray-700/50 pb-2 mb-3">
                          Notifications
                        </h3>
                        {notifications.length === 0 ? (
                          <p className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
                            Aucune notification
                          </p>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              className="relative mb-3 p-3 bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-700/50 rounded-md hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors duration-200 cursor-pointer"
                              onClick={() => handleNotificationClick(notif)}
                            >
                              <div className="flex items-start space-x-3">
                                {!notif.is_read && (
                                  <span className="mt-1.5 h-2 w-2 bg-blue-500 rounded-full flex-shrink-0" />
                                )}
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                    {notif.request_title}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {notif.message}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    {new Date(notif.created_at).toLocaleString('fr-FR')}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={(e) => handleDeleteNotification(notif.id, e)}
                                className="absolute top-2 right-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                                aria-label="Supprimer la notification"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </nav>

            <div className="mt-4 flex flex-col space-y-2 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
              <button
                onClick={toggleTheme}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                aria-label={darkMode ? 'Passer au mode clair' : 'Passer au mode sombre'}
              >
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                <span className="ml-2">{darkMode ? 'Mode clair' : 'Mode sombre'}</span>
              </button>

              {user ? (
                <>
                  <Link
                    to={user.role === 'admin' ? '/admin/profil' : '/client/profil'}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User size={16} className="mr-2" />
                    <span>{displayName}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/50 rounded-md transition-colors duration-200"
                  >
                    <LogOut size={16} className="mr-2" />
                    <span>Déconnexion</span>
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link
                    to="/connexion"
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-600/50 rounded-md hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/inscription"
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-md hover:from-blue-600 hover:to-purple-600 transition-colors duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Inscription
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 pt-20 md:pt-24">
        <div className="container mx-auto px-4 py-8">
          <Outlet />
        </div>
      </main>

      <footer className="border-t border-gray-200/50 dark:border-gray-700/50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-white dark:to-white">
              SatisGest
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              © 2025 SatisGest. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;