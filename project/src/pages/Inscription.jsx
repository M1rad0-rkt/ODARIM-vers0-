import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, User, Mail, Eye, EyeOff, UserPlus } from 'lucide-react';

const Inscription = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validatePassword = () => {
    return password.trim().length >= 6;
  };

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email.trim());
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setNotification(null);

    // Trim des valeurs pour éviter les espaces
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    // Debug : afficher les valeurs soumises
    console.log('Valeurs soumises:', {
      name: trimmedName,
      email: trimmedEmail,
      password: trimmedPassword,
      confirmPassword: trimmedConfirmPassword,
      username: trimmedEmail,
    });

    if (!trimmedName || !trimmedEmail || !trimmedPassword || !trimmedConfirmPassword) {
      setNotification({ type: 'error', message: 'Veuillez remplir tous les champs.' });
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setNotification({ type: 'error', message: 'Veuillez entrer une adresse email valide.' });
      return;
    }

    if (!validatePassword()) {
      setNotification({ type: 'error', message: 'Le mot de passe doit contenir au moins 6 caractères.' });
      return;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      setNotification({ type: 'error', message: 'Les mots de passe ne correspondent pas.' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          password: trimmedPassword,
          username: trimmedEmail, 
        }),
      });

      const data = await response.json();

      // Debug : afficher la réponse API
      console.log('Réponse API:', data);

      if (!response.ok) {
        setNotification({
          type: 'error',
          message: data.detail || 'Erreur lors de la création de l’utilisateur.',
        });
        return;
      }

      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setNotification({ type: 'success', message: 'Compte créé avec succès ! Redirection...' });
      setTimeout(() => navigate('/connexion'), 2000); // Rediriger vers connexion
    } catch (error) {
      console.error('Erreur réseau:', error);
      setNotification({ type: 'error', message: 'Erreur de communication avec le serveur.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-blue-50 dark:from-gray-900 dark:to-blue-900/50 p-6">
      <div className="w-full max-w-md bg-white dark:bg-gray-800/95 rounded-2xl shadow-2xl p-8 transition-all duration-500 hover:shadow-3xl animate-fade-in">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-5">
            <div className="relative group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                <UserPlus size={32} className="text-white" />
              </div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/20 to-green-400/20 opacity-0 group-hover:opacity-20 transition-all duration-300"></div>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-700 dark:text-gray-100">Inscription</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Créez un nouveau compte SatisGest</p>
        </div>

        {notification && (
          <div className={`mb-6 p-4 rounded-lg flex items-center animate-slide-in ${notification.type === 'success' ? 'bg-green-50 dark:bg-green-900/60 text-green-600 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/60 text-red-600 dark:text-red-300'}`}>
            {notification.type === 'success' ? <CheckCircle2 size={20} className="mr-2 animate-pulse" /> : <AlertCircle size={20} className="mr-2" />}
            <span>{notification.message}</span>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center mb-6 space-x-2 text-gray-600 dark:text-gray-300">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium">Chargement...</span>
          </div>
        )}

        <form onSubmit={handleCreateUser} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Nom complet
            </label>
            <div className="relative">
              <input
                id="name"
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Votre nom complet"
                className="block w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
              <User size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Adresse email
            </label>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemple@example.com"
                className="block w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
              <Mail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Mot de passe
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Créez un mot de passe"
                className="block w-full pl-4 pr-12 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-blue-500 transition-colors duration-200"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="mt-1 text-xs flex items-center space-x-2">
              <span className={validatePassword() ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}>
                {validatePassword() ? <CheckCircle2 size={14} className="inline mr-1" /> : <AlertCircle size={14} className="inline mr-1" />}
                Au moins 6 caractères
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmez le mot de passe"
                className="block w-full pl-4 pr-12 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-blue-500 transition-colors duration-200"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {password && confirmPassword && (
              <div className="mt-1 text-xs">
                {password === confirmPassword ? (
                  <span className="text-green-600 dark:text-green-400 flex items-center space-x-1">
                    <CheckCircle2 size={14} className="inline mr-1" />
                    <span>Les mots de passe correspondent</span>
                  </span>
                ) : (
                  <span className="text-red-600 dark:text-red-400 flex items-center space-x-1">
                    <AlertCircle size={14} className="inline mr-1" />
                    <span>Les mots de passe ne correspondent pas</span>
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-green-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Inscription...' : 'S\'inscrire'}
            </button>
            <button
              type="button"
              onClick={() => {
                setName('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setNotification(null);
              }}
              className="flex-1 py-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:from-gray-300 hover:to-gray-400 dark:hover:from-gray-500 dark:hover:to-gray-600 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-300"
            >
              Réinitialiser
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Vous avez déjà un compte ?{' '}
          <Link to="/connexion" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors duration-200">
            Connectez-vous
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Inscription;