import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, User, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { fetchProfile, updateProfile, changePassword } from '../../api/requests';

const Profil = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchProfile();
        if (!data || !data.username) throw new Error("Impossible de charger le profil.");
        setUsername(data.username);
        setEmail(data.email);
        setCreatedAt(data.created_at);
        setRole(data.role === 'admin' ? 'Administrateur' : 'Client');
      } catch (err) {
        setError(err.message || "Erreur inconnue.");
        if (err.message?.toLowerCase().includes("reconnecter")) {
          navigate('/connexion');
        }
      }
    };
    loadProfile();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await updateProfile(username, email);
      setSuccess('Vos informations ont été mises à jour avec succès.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || "La mise à jour a échoué.");
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    setPasswordLoading(true);

    if (!currentPassword) {
      setPasswordError('Veuillez entrer votre mot de passe actuel.');
      setPasswordLoading(false);
      return;
    }
    if (!validatePassword(newPassword)) {
      setPasswordError(
        'Le nouveau mot de passe doit contenir au moins 8 caractères, incluant une majuscule, une minuscule, un chiffre et un caractère spécial.'
      );
      setPasswordLoading(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas.');
      setPasswordLoading(false);
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess('Mot de passe changé avec succès.');
      setTimeout(() => setPasswordSuccess(''), 3000);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
    } catch (err) {
      setPasswordError(err.message || "Le changement de mot de passe a échoué.");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 p-6 animate-slide-in">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 tracking-tight">
            Mon Profil
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Gérez vos informations personnelles et sécurisez votre compte
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulaire de modification */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300 animate-slide-in">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Informations Personnelles
              </h2>

              {error && (
                <div className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-700 flex items-start transition-opacity duration-300">
                  <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {success && (
                <div className="mb-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/50 text-green-600 dark:text-green-300 border border-green-200 dark:border-green-700 flex items-start transition-opacity duration-300">
                  <CheckCircle2 size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{success}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom d'utilisateur
                  </label>
                  <input
                    id="username"
                    type="text"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 transition-colors duration-200 text-sm"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Adresse email
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 transition-colors duration-200 text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-green-600 dark:bg-green-700 text-white text-sm font-medium hover:bg-green-700 dark:hover:bg-green-800 transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? 'Mise à jour...' : 'Enregistrer les modifications'}
                  </button>
                </div>
              </form>
            </div>

            {/* Formulaire de changement de mot de passe */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300 animate-slide-in">
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="flex items-center text-lg font-semibold text-green-600 dark:text-green-400 mb-4 hover:text-green-700 dark:hover:text-green-300 transition-colors duration-200"
              >
                Changer le mot de passe
                {showPasswordForm ? (
                  <ChevronUp size={20} className="ml-2" />
                ) : (
                  <ChevronDown size={20} className="ml-2" />
                )}
              </button>

              {showPasswordForm && (
                <div className="animate-slide-in">
                  {passwordError && (
                    <div className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-700 flex items-start transition-opacity duration-300">
                      <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{passwordError}</span>
                    </div>
                  )}

                  {passwordSuccess && (
                    <div className="mb-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/50 text-green-600 dark:text-green-300 border border-green-200 dark:border-green-700 flex items-start transition-opacity duration-300">
                      <CheckCircle2 size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{passwordSuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handlePasswordSubmit}>
                    <div className="mb-4 relative">
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Mot de passe actuel
                      </label>
                      <div className="relative">
                        <input
                          id="currentPassword"
                          type={showCurrentPassword ? 'text' : 'password'}
                          className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 transition-colors duration-200 text-sm pr-10"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
                          aria-label={showCurrentPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                        >
                          {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    <div className="mb-4 relative">
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Nouveau mot de passe
                      </label>
                      <div className="relative">
                        <input
                          id="newPassword"
                          type={showNewPassword ? 'text' : 'password'}
                          className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 transition-colors duration-200 text-sm pr-10"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
                          aria-label={showNewPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                        >
                          {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    <div className="mb-6 relative">
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Confirmer le nouveau mot de passe
                      </label>
                      <div className="relative">
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 transition-colors duration-200 text-sm pr-10"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
                          aria-label={showConfirmPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                        >
                          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3">
                      <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 rounded-lg bg-green-600 dark:bg-green-700 text-white text-sm font-medium hover:bg-green-700 dark:hover:bg-green-800 transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                        disabled={passwordLoading}
                      >
                        {passwordLoading ? 'Changement...' : 'Changer le mot de passe'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPasswordForm(false)}
                        className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500"
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Résumé utilisateur */}
          <div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300 sticky top-6 animate-slide-in text-center">
              <div className="mb-4">
                <div className="w-24 h-24 rounded-full bg-green-600/10 dark:bg-green-700/10 text-green-600 dark:text-green-400 flex items-center justify-center mx-auto">
                  <User size={48} />
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{username}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{email}</p>

              <div className="border-t border-gray-200 dark:border-gray-600 pt-4 mt-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <p>
                    Compte créé le :{' '}
                    {createdAt && new Date(createdAt).toLocaleDateString('fr-FR')}
                  </p>
                  <p>Type de compte : {role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profil;