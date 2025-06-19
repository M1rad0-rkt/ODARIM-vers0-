import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, User, Mail, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';

async function makeAuthenticatedRequest(url, options = {}) {
  let accessToken = localStorage.getItem('access_token');

  if (!accessToken) {
    throw new Error('Aucun token d’authentification trouvé.');
  }

  options.headers = {
    ...options.headers,
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  let response = await fetch(url, options);

  if (response.status === 401) {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('Aucun token de rafraîchissement disponible.');
    }

    try {
      const refreshResponse = await fetch('http://localhost:8000/api/token/refresh/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!refreshResponse.ok) {
        throw new Error('Échec du rafraîchissement du token.');
      }

      const refreshData = await refreshResponse.json();
      accessToken = refreshData.access;
      localStorage.setItem('access_token', accessToken);

      options.headers.Authorization = `Bearer ${accessToken}`;
      response = await fetch(url, options);
    } catch (refreshError) {
      console.error('Erreur lors du rafraîchissement du token:', refreshError);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/connexion';
      throw refreshError;
    }
  }

  return response;
}

const Profil = () => {
  const [first_name, setFirstName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [created_at, setCreatedAt] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await makeAuthenticatedRequest('http://localhost:8000/api/users/me/', {
          method: 'GET',
        });
        const data = await response.json();
        if (!response.ok || !data?.username) {
          throw new Error(data.detail || 'Impossible de charger le profil.');
        }
        setFirstName(data.first_name || '');
        setUsername(data.email);
        setEmail(data.email);
        setCreatedAt(data.created_at);
        setRole(data.role === 'admin' ? 'Administrateur' : 'Client');
      } catch (err) {
        console.error('Profile Fetch Error:', err);
        setNotification({ type: 'error', message: err.message || 'Erreur inconnue.' });
        if (err.message?.toLowerCase().includes('reconnecter')) {
          navigate('/connexion');
        }
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [navigate]);

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const validateMinPassword = (password) => {
    return password.length >= 6;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotification(null);
    setLoading(true);

    if (!email || !username) {
      setNotification({ type: 'error', message: 'Les champs email et nom d\'utilisateur sont requis.' });
      setLoading(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setNotification({ type: 'error', message: 'Veuillez entrer une adresse email valide.' });
      setLoading(false);
      return;
    }

    try {
      const response = await makeAuthenticatedRequest('http://localhost:8000/api/users/me/', {
        method: 'PUT',
        body: JSON.stringify({ first_name, email, username: email }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'La mise à jour a échoué.');
      }
      setNotification({ type: 'success', message: 'Vos informations ont été mises à jour avec succès.' });
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error('Profile Update Error:', err);
      setNotification({ type: 'error', message: err.message || 'La mise à jour a échoué.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setNotification(null);
    setPasswordLoading(true);

    if (!currentPassword) {
      setNotification({ type: 'error', message: 'Veuillez entrer votre mot de passe actuel.' });
      setPasswordLoading(false);
      return;
    }
    if (!validatePassword(newPassword)) {
      setNotification({
        type: 'error',
        message: 'Le nouveau mot de passe doit contenir au moins 8 caractères, incluant une majuscule, une minuscule, un chiffre et un caractère spécial.',
      });
      setPasswordLoading(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setNotification({ type: 'error', message: 'Les mots de passe ne correspondent pas.' });
      setPasswordLoading(false);
      return;
    }

    try {
      const response = await makeAuthenticatedRequest('http://localhost:8000/api/users/me/password/', {
        method: 'PATCH',
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Le changement de mot de passe a échoué.');
      }
      setNotification({ type: 'success', message: 'Mot de passe changé avec succès.' });
      setTimeout(() => setNotification(null), 3000);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
    } catch (err) {
      console.error('Password Change Error:', err);
      setNotification({ type: 'error', message: err.message || 'Le changement de mot de passe a échoué.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center transition-transform duration-300 hover:scale-105">
              <User size={30} className="text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Mon Profil</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Gérez vos informations personnelles et sécurisez votre compte</p>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`p-4 rounded-lg flex items-center space-x-2 transition-all duration-300 ${
            notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {notification.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span className="text-sm">{notification.message}</span>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center space-x-2 text-gray-600 dark:text-gray-400">
            <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">Chargement...</span>
          </div>
        )}

        {/* Profile Form */}
        <div className="bg-white dark:bg-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Informations Personnelles</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="nom" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nom complet
              </label>
              <div className="relative mt-1">
                <input
                  id="nom"
                  type="text"
                  className="w-full px-4 py-2.5 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  value={first_name}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Votre nom"
                />
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Adresse email
              </label>
              <div className="relative mt-1">
                <input
                  id="email"
                  type="email"
                  className="w-full px-4 py-2.5 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemple@domaine.com"
                  required
                />
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Mise à jour...' : 'Enregistrer les modifications'}
            </button>
          </form>
        </div>

        {/* Password Form */}
        <div className="bg-white dark:bg-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="flex items-center text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors duration-200"
          >
            Changer le mot de passe
            {showPasswordForm ? <ChevronUp size={20} className="ml-2" /> : <ChevronDown size={20} className="ml-2" />}
          </button>

          {showPasswordForm && (
            <div className="mt-4 space-y-4 animate-slide-down">
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mot de passe actuel
                  </label>
                  <div className="relative mt-1">
                    <input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      className="w-full px-4 py-2.5 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Mot de passe actuel"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-indigo-500 transition-colors duration-200"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nouveau mot de passe
                  </label>
                  <div className="relative mt-1">
                    <input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      className="w-full px-4 py-2.5 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nouveau mot de passe"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-indigo-500 transition-colors duration-200"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <span className={validateMinPassword(newPassword) ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                      {validateMinPassword(newPassword) ? <CheckCircle2 size={14} className="inline mr-1" /> : <AlertCircle size={14} className="inline mr-1" />}
                      Au moins 6 caractères
                    </span>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative mt-1">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="w-full px-4 py-2.5 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirmez le mot de passe"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-indigo-500 transition-colors duration-200"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {newPassword && confirmPassword && (
                    <div className="mt-1 text-xs">
                      {newPassword === confirmPassword ? (
                        <span className="text-green-600 dark:text-green-400 flex items-center">
                          <CheckCircle2 size={14} className="mr-1" />
                          Les mots de passe correspondent
                        </span>
                      ) : (
                        <span className="text-red-600 dark:text-red-400 flex items-center">
                          <AlertCircle size={14} className="mr-1" />
                          Les mots de passe ne correspondent pas
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={passwordLoading}
                >
                  {passwordLoading ? 'Changement...' : 'Changer le mot de passe'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Account Summary */}
        <div className="bg-white dark:bg-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Résumé du compte</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <User size={20} className="text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Rôle</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{role}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Mail size={20} className="text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-1" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Date d'inscription</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {created_at ? new Date(created_at).toLocaleDateString('fr-FR') : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-slide-down {
            animation: slideDown 0.3s ease-out forwards;
          }
        `}</style>
      </div>
    </div>
  );
};

export default Profil;