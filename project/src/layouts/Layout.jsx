import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Sun, Moon, ChevronDown, LogOut, User, Home, Menu, X, MessageSquare, Bell, Send, Loader2, Trash2
} from 'lucide-react';
import { getNotifications, markNotificationAsRead, deleteNotification } from '../api/requests';
import { toast } from 'react-toastify';
import { debounce } from 'lodash';

// Composant AIAssistant
const AIAssistant = () => {
  const [isChatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fonction pour effacer la conversation localement
  const clearChat = () => {
    setMessages([]);
    toast.info('Conversation effacée localement');
  };

  // Fonction pour rafraîchir le token
  const refreshToken = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: localStorage.getItem('refresh_token') }),
      });
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      const data = await response.json();
      localStorage.setItem('access_token', data.access);
      toast.success('Token rafraîchi avec succès');
      return data.access;
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      toast.error('Session expirée. Veuillez vous reconnecter.');
      return null;
    }
  };

  // Fonction pour effectuer une requête avec gestion du token
  const fetchWithAuth = async (url, options) => {
    let token = localStorage.getItem('access_token');
    if (!token) throw new Error('Aucun token d\'accès trouvé.');
    options.headers = { ...options.headers, Authorization: `Bearer ${token}` };
    let response = await fetch(url, options);
    if (response.status === 401) {
      token = await refreshToken();
      if (token) {
        options.headers.Authorization = `Bearer ${token}`;
        response = await fetch(url, options);
      } else {
        throw new Error('Impossible de rafraîchir le token');
      }
    }
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Erreur HTTP: ${response.status}`;
      if (response.status === 400) errorMessage = 'Requête invalide.';
      else if (response.status === 401) errorMessage = 'Authentification échouée.';
      else if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        errorMessage = `Quota dépassé. Réessayez dans ${retryAfter || 'quelques'} secondes.`;
      } else if (response.status === 503) errorMessage = 'Service indisponible.';
      else if (response.status === 500) errorMessage = 'Erreur serveur.';
      throw new Error(`${errorMessage} - ${errorText}`);
    }
    return response.json();
  };

  // Charger l'historique des messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await fetchWithAuth(`http://localhost:8000/api/ai-assistant/history/`, {
          headers: {},
        });
        const mappedMessages = data.map(msg => ({
          sender: msg.sender,
          text: msg.message,
        }));
        setMessages(mappedMessages);
      } catch (error) {
        console.error('Erreur lors du chargement des messages:', error.message);
        toast.error(`Erreur: ${error.message}`);
      }
    };
    fetchMessages();
  }, []);

  // Envoyer un message à l'API
  const sendMessage = async (retryCount = 0, maxRetries = 3) => {
    if (!input.trim()) return;
    setIsLoading(true);
    const userMessage = { sender: 'user', text: input };
    setMessages([...messages, userMessage]);
    try {
      const data = await fetchWithAuth(`http://localhost:8000/api/ai-assistant/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });
      const aiMessage = { sender: 'ai', text: data.response || 'Aucune réponse.' };
      setMessages([...messages, userMessage, aiMessage]);
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error.message);
      if (error.message.includes('Quota dépassé') && retryCount < maxRetries) {
        const retryAfter = 2000 * (retryCount + 1);
        toast.warn(`Quota dépassé. Nouvelle tentative dans ${retryAfter / 1000}s...`);
        setTimeout(() => sendMessage(retryCount + 1, maxRetries), retryAfter);
        return;
      }
      toast.error(error.message);
      setMessages([...messages, userMessage, { sender: 'ai', text: error.message }]);
    } finally {
      setIsLoading(false);
    }
    setInput('');
  };

  const debouncedSendMessage = debounce(sendMessage, 500);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={() => setChatOpen(!isChatOpen)}
        className="p-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
        aria-label={isChatOpen ? 'Fermer l\'assistant IA' : 'Ouvrir l\'assistant IA'}
      >
        {isChatOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {isChatOpen && (
        <div className="mt-4 w-96 max-h-[70vh] bg-white/95 dark:bg-gray-900/95 rounded-2xl border border-gray-200/30 dark:border-gray-700/30 shadow-2xl flex flex-col backdrop-blur-md transition-all duration-300 animate-slide-up">
          <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-2xl flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Assistant IA</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={clearChat}
                className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white"
                aria-label="Effacer la conversation"
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={() => setChatOpen(false)}
                className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white"
                aria-label="Fermer le chat"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
            {messages.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Commencez à discuter !</p>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-3 p-3 rounded-lg max-w-[80%] ${
                    msg.sender === 'user'
                      ? 'bg-indigo-100 dark:bg-indigo-900/50 text-gray-800 dark:text-gray-200 ml-auto'
                      : 'bg-gray-100 dark:bg-gray-800/50 text-gray-800 dark:text-gray-200'
                  } transition-all duration-200`}
                >
                  {msg.text}
                </div>
              ))
            )}
          </div>
          <div className="p-4 border-t border-gray-200/30 dark:border-gray-700/30">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && debouncedSendMessage()}
                className="flex-1 p-2 text-sm text-gray-800 dark:text-gray-200 bg-gray-100/50 dark:bg-gray-800/50 border border-gray-200/30 dark:border-gray-700/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                placeholder="Posez votre question..."
                disabled={isLoading}
                aria-label="Saisir un message pour l'assistant IA"
              />
              <button
                onClick={debouncedSendMessage}
                disabled={isLoading}
                className={`p-2 rounded-lg text-white ${
                  isLoading ? 'bg-gray-400' : 'bg-indigo-500 hover:bg-indigo-600'
                } transition-all duration-200`}
                aria-label="Envoyer le message"
              >
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Le reste du composant Layout reste inchangé
const Layout = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setNotificationOpen] = useState(false);
  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

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

  const handleDeleteNotification = async (notificationId, event) => {
    event.stopPropagation();
    try {
      await deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      toast.success('Notification supprimée');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleLogout = () => setLogoutModalOpen(true);

  const confirmLogout = async () => {
    try {
      await logout();
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      toast.success('Déconnexion réussie');
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      toast.error('Erreur lors de la déconnexion');
    } finally {
      setLogoutModalOpen(false);
    }
  };

  const cancelLogout = () => setLogoutModalOpen(false);

  const renderLinks = () => {
    if (!user) return null;
    const commonProps = {
      className:
        'px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-500 dark:hover:text-indigo-400 transition-all duration-200 rounded-lg hover:bg-gray-100/30 dark:hover:bg-gray-800/30 flex items-center space-x-2',
    };
    return (
      <>
        {user.role === 'client' && (
          <>
            <Link to="/client" {...commonProps}>
              <Home size={16} />
              <span>Tableau de bord</span>
            </Link>
            <Link to="/client/demandes" {...commonProps}>
              <MessageSquare size={16} />
              <span>Mes demandes</span>
            </Link>
          </>
        )}
        {user.role === 'admin' && (
          <>
            <Link to="/admin/demandes" {...commonProps}>
              <MessageSquare size={16} />
              <span>Gestion demandes</span>
            </Link>
            <Link to="/admin/satisfaction" {...commonProps}>
              <MessageSquare size={16} />
              <span>Analyse satisfaction</span>
            </Link>
          </>
        )}
      </>
    );
  };

  const renderMobileLinks = () => {
    if (!user) return null;
    const linkClasses =
      'px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100/30 dark:hover:bg-gray-800/30 transition-all duration-200 flex items-center space-x-2';
    return (
      <>
        {user.role === 'client' && (
          <Link to="/client/demandes" className={linkClasses} onClick={() => setMobileMenuOpen(false)}>
            <MessageSquare size={16} />
            <span>Mes demandes</span>
          </Link>
        )}
        {user.role === 'admin' && (
          <>
            <Link to="/admin/demandes" className={linkClasses} onClick={() => setMobileMenuOpen(false)}>
              <MessageSquare size={16} />
              <span>Gestion demandes</span>
            </Link>
            <Link to="/admin/satisfaction" className={linkClasses} onClick={() => setMobileMenuOpen(false)}>
              <MessageSquare size={16} />
              <span>Analyse satisfaction</span>
            </Link>
          </>
        )}
      </>
    );
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const displayName = user?.first_name || 'Utilisateur';
  const avatarInitial = user?.first_name?.charAt(0).toUpperCase() || '?';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
      {/* Fond décoratif */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] bg-gradient-to-br from-indigo-300/20 to-purple-300/20 dark:from-indigo-800/20 dark:to-purple-800/20 blur-3xl rounded-full animate-float"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] bg-gradient-to-br from-purple-300/20 to-pink-300/20 dark:from-purple-800/20 dark:to-pink-800/20 blur-3xl rounded-full animate-float-delayed"></div>
      </div>

      {/* En-tête */}
      <header className="fixed top-0 w-full z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-b border-gray-200/30 dark:border-gray-700/30 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400"
          >
            Clientélia
          </Link>

          {/* Navigation Desktop */}
          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex space-x-4">
              <Link
                to="/"
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-500 dark:hover:text-indigo-400 transition-all duration-200 rounded-lg hover:bg-gray-100/30 dark:hover:bg-gray-800/30 flex items-center space-x-2"
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
                    className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100/30 dark:hover:bg-gray-800/30 transition-all duration-200 relative"
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
                    <div className="absolute right-0 mt-2 w-96 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg rounded-2xl border border-gray-200/30 dark:border-gray-700/30 shadow-xl max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                      <div className="p-4">
                        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200/30 dark:border-gray-700/30 pb-2 mb-3">
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
                              className="relative mb-3 p-3 bg-white dark:bg-gray-800/50 border border-gray-200/30 dark:border-gray-700/30 rounded-lg hover:bg-gray-100/20 dark:hover:bg-gray-700/20 transition-all duration-200 cursor-pointer group"
                              onClick={() => handleNotificationClick(notif)}
                            >
                              <div className="flex items-start space-x-3">
                                {!notif.is_read && (
                                  <span className="mt-1.5 h-2 w-2 bg-indigo-500 rounded-full flex-shrink-0" />
                                )}
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                    {notif.request_title}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                    {notif.message}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    {new Date(notif.created_at).toLocaleString('fr-FR')}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={(e) => handleDeleteNotification(notif.id, e)}
                                className="absolute top-2 right-2 p-1 bg-gray-100/50 dark:bg-gray-700/50 rounded-full text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
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
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100/30 dark:hover:bg-gray-800/30 transition-all duration-200"
                aria-label={darkMode ? 'Passer au mode clair' : 'Passer au mode sombre'}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100/30 dark:hover:bg-gray-800/30 transition-all duration-200"
                    aria-controls="profile-menu"
                    aria-expanded={isProfileMenuOpen}
                  >
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white flex items-center justify-center text-sm font-medium">
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
                      className="absolute right-0 mt-2 w-64 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg rounded-2xl border border-gray-200/30 dark:border-gray-700/30 shadow-xl"
                    >
                      <div className="p-4">
                        <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200/30 dark:border-gray-700/30 mb-3">
                          <span className="font-medium text-gray-800 dark:text-gray-200">{displayName}</span>
                          <br />
                          {user.email}
                        </div>
                        <Link
                          to={user.role === 'admin' ? '/admin/profil' : '/client/profil'}
                          className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100/30 dark:hover:bg-gray-800/30 rounded-lg transition-all duration-200"
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          <User size={16} className="mr-2" />
                          Mon profil
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50/20 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
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
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-200/30 dark:border-gray-700/30 rounded-lg hover:bg-gray-100/30 dark:hover:bg-gray-800/30 transition-all duration-200"
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/inscription"
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-200"
                  >
                    Inscription
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Bouton menu mobile */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100/30 dark:hover:bg-gray-800/30 transition-all duration-200"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Menu mobile */}
        {isMobileMenuOpen && (
          <div className="md:hidden px-4 pb-4 pt-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200/30 dark:border-gray-700/30 animate-slide-down">
            <nav className="flex flex-col space-y-2">
              <Link
                to="/"
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100/30 dark:hover:bg-gray-800/30 transition-all duration-200 flex items-center space-x-2"
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
                    className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100/30 dark:hover:bg-gray-800/30 transition-all duration-200"
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
                    <div className="mt-2 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg rounded-2xl border border-gray-200/30 dark:border-gray-700/30 shadow-xl max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                      <div className="p-4">
                        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200/30 dark:border-gray-700/30 pb-2 mb-3">
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
                              className="relative mb-3 p-3 bg-white dark:bg-gray-800/50 border border-gray-200/30 dark:border-gray-700/30 rounded-lg hover:bg-gray-100/20 dark:hover:bg-gray-700/20 transition-all duration-200 cursor-pointer group"
                              onClick={() => handleNotificationClick(notif)}
                            >
                              <div className="flex items-start space-x-3">
                                {!notif.is_read && (
                                  <span className="mt-1.5 h-2 w-2 bg-indigo-500 rounded-full flex-shrink-0" />
                                )}
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                    {notif.request_title}
                                  </p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                    {notif.message}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    {new Date(notif.created_at).toLocaleString('fr-FR')}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={(e) => handleDeleteNotification(notif.id, e)}
                                className="absolute top-2 right-2 p-1 bg-gray-100/50 dark:bg-gray-700/50 rounded-full text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
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

            <div className="mt-4 flex flex-col space-y-2 pt-4 border-t border-gray-200/30 dark:border-gray-700/30">
              <button
                onClick={toggleTheme}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100/30 dark:hover:bg-gray-800/30 transition-all duration-200"
                aria-label={darkMode ? 'Passer au mode clair' : 'Passer au mode sombre'}
              >
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                <span className="ml-2">{darkMode ? 'Mode clair' : 'Mode sombre'}</span>
              </button>
              {user ? (
                <>
                  <Link
                    to={user.role === 'admin' ? '/admin/profil' : '/client/profil'}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100/30 dark:hover:bg-gray-800/30 transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User size={16} className="mr-2" />
                    <span>{displayName}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50/20 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                  >
                    <LogOut size={16} className="mr-2" />
                    <span>Déconnexion</span>
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link
                    to="/connexion"
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-200/30 dark:border-gray-700/30 rounded-lg hover:bg-gray-100/30 dark:hover:bg-gray-800/30 transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/inscription"
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-200"
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

      {/* Modal de déconnexion */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-80 border border-gray-200/30 dark:border-gray-700/30 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Confirmer la déconnexion
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Êtes-vous sûr de vouloir vous déconnecter ?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100/50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-all duration-200"
              >
                Annuler
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all duration-200"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contenu principal */}
      <main className="flex-1 pt-20 md:pt-24">
        <div className="container mx-auto px-4 py-8">
          <Outlet />
        </div>
      </main>

      {/* Pied de page */}
      <footer className="border-t border-gray-200/30 dark:border-gray-700/30 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              Clientélia
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              © 2025 Clientélia. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>

      <AIAssistant />
    </div>
  );
};

export default Layout;