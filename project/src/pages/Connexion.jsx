import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, LogIn, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Connexion = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
  
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }
  
    try {
      setLoading(true);
  
      const response = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
  
      if (!response.ok) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Identifiants invalides');
      }
  
      const data = await response.json();
  
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
  
      const userResponse = await fetch('http://localhost:8000/api/users/me/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${data.access}`,
        },
      });
  
      if (!userResponse.ok) {
        throw new Error('Erreur lors de la récupération des informations utilisateur');
      }
  
      const userData = await userResponse.json();
  
      login({ ...userData, token: data.access });
  
      if (userData.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/client');
      }
    } catch (err) {
      if (err.name === 'TypeError') {
        setError("Impossible de joindre le serveur, vérifiez votre connexion.");
      } else {
        setError(err.message || 'Erreur lors de la connexion');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-blue-400/30 to-purple-400/30 dark:from-blue-800/30 dark:to-purple-800/30 blur-3xl rounded-full animate-float"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-purple-400/30 to-pink-400/30 dark:from-purple-800/30 dark:to-pink-800/30 blur-3xl rounded-full animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] bg-gradient-to-br from-blue-300/20 to-purple-300/20 dark:from-blue-900/20 dark:to-purple-900/20 blur-2xl rounded-full animate-pulse-slow"></div>
      </div>

      <div className="w-full max-w-md bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-gray-200/40 dark:border-gray-700/40 transition-all duration-500 animate-slide-in">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
                <LogIn size={32} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-200/30 to-purple-200/30 dark:from-blue-800/30 dark:to-purple-800/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 animate-gradient-text">
            Connexion
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Accédez à votre espace SatisGest</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100/90 dark:bg-red-900/90 text-red-600 dark:text-red-300 rounded-xl flex items-center animate-slide-in">
            <AlertCircle size={20} className="mr-2 flex-shrink-0 animate-pulse" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
              Adresse email
            </label>
            <div className="relative group">
              <input
                id="email"
                type="email"
                className="w-full px-4 py-3 pl-10 border border-gray-200 dark:border-gray-600 rounded-xl bg-white/60 dark:bg-gray-700/60 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 group-hover:shadow-md"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemple@domaine.com"
                required
              />
              <Mail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 transition-transform duration-300 group-hover:scale-110" />
            </div>
          </div>

          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
              Mot de passe
            </label>
            <div className="relative group">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="w-full px-4 py-3 pr-12 border border-gray-200 dark:border-gray-600 rounded-xl bg-white/60 dark:bg-gray-700/60 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 group-hover:shadow-md"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:scale-110"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 dark:hover:from-blue-700 dark:hover:to-purple-700 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
            disabled={loading}
          >
            <span className="relative z-10">{loading ? 'Connexion en cours...' : 'Se connecter'}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          </button>
        </form>

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
            Vous n'avez pas de compte ?{' '}
            <Link to="/inscription" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-all duration-300 hover:underline hover:scale-105 inline-block">
              Inscrivez-vous
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Connexion;