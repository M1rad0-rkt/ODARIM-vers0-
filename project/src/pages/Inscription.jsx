import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, CheckCircle, UserPlus, Mail, User } from 'lucide-react';

const Inscription = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const validatePassword = () => {
    return password.length >= 6;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (!validatePassword()) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
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
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data && data.error) {
          setError(data.error);
        } else {
          setError('Erreur lors de l\'inscription');
        }
        return;
      }

      navigate('/client');
    } catch (err) {
      setError('Erreur de communication avec le serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Fond animé */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gradient-to-br from-blue-400/20 to-purple-400/20 dark:from-blue-800/20 dark:to-purple-800/20 blur-3xl rounded-full animate-float"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gradient-to-br from-purple-400/20 to-pink-400/20 dark:from-purple-800/20 dark:to-pink-800/20 blur-3xl rounded-full animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] bg-gradient-to-br from-blue-300/10 to-purple-300/10 dark:from-blue-900/10 dark:to-purple-900/10 blur-2xl rounded-full animate-pulse-slow"></div>
      </div>

      {/* Conteneur en glassmorphism */}
      <div className="w-full max-w-md bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-gray-200/40 dark:border-gray-700/40 transition-all duration-500">
        <div className="text-center mb-8">
          {/* Icône animée */}
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                <UserPlus size={32} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-200/30 to-purple-200/30 dark:from-blue-800/30 dark:to-purple-800/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </div>
          {/* Titre avec gradient animé */}
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 animate-gradient-text">
            Inscription
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Créez votre compte SatisGest</p>
        </div>

        {/* Message d'erreur avec animation */}
        {error && (
          <div className="mb-6 p-4 bg-red-100/90 dark:bg-red-900/90 text-red-600 dark:text-red-300 rounded-xl flex items-center animate-slide-in">
            <AlertCircle size={20} className="mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Champ Nom */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
              Nom complet
            </label>
            <div className="relative">
              <input
                id="name"
                type="text"
                className="w-full px-4 py-3 pl-10 border border-gray-200 dark:border-gray-600 rounded-xl bg-white/60 dark:bg-gray-700/60 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
              <User size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            </div>
          </div>

          {/* Champ Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
              Adresse email
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                className="w-full px-4 py-3 pl-10 border border-gray-200 dark:border-gray-600 rounded-xl bg-white/60 dark:bg-gray-700/60 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemple@domaine.com"
                required
              />
              <Mail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            </div>
          </div>

          {/* Champ Mot de passe */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
              Mot de passe
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="w-full px-4 py-3 pr-12 border border-gray-200 dark:border-gray-600 rounded-xl bg-white/60 dark:bg-gray-700/60 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Créez un mot de passe"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="mt-1.5 text-xs flex items-center space-x-2">
              <span className={password.length >= 6 ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}>
                {password.length >= 6 ? <CheckCircle size={14} className="inline mr-1" /> : <AlertCircle size={14} className="inline mr-1" />}
                Au moins 6 caractères
              </span>
            </div>
          </div>

          {/* Champ Confirmation */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
              Confirmer le mot de passe
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white/60 dark:bg-gray-700/60 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmez votre mot de passe"
              required
            />
            {password && confirmPassword && (
              <div className="mt-1.5 text-xs">
                {password === confirmPassword ? (
                  <span className="text-green-600 dark:text-green-400 flex items-center space-x-1">
                    <CheckCircle size={14} className="flex-shrink-0" />
                    <span>Les mots de passe correspondent</span>
                  </span>
                ) : (
                  <span className="text-red-600 dark:text-red-400 flex items-center space-x-1">
                    <AlertCircle size={14} className="flex-shrink-0" />
                    <span>Les mots de passe ne correspondent pas</span>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Bouton */}
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 dark:hover:from-blue-700 dark:hover:to-purple-700 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            disabled={loading}
          >
            {loading ? 'Inscription en cours...' : 'S\'inscrire'}
          </button>
        </form>

        {/* Lien de connexion */}
        <div className="mt-8 text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white/95 dark:bg-gray-800/95 text-gray-500 dark:text-gray-400">ou</span>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
            Vous avez déjà un compte ?{' '}
            <Link to="/connexion" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-300">
              Connectez-vous
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Inscription;