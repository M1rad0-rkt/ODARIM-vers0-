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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-blue-50 dark:from-gray-900 dark:to-blue-900/50 p-6">
      <div className="w-full max-w-md bg-white dark:bg-gray-800/95 rounded-2xl shadow-2xl p-8 transition-all duration-500 hover:shadow-3xl animate-fade-in">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-5">
            <div className="relative group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                <LogIn size={32} className="text-white" />
              </div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/20 to-green-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Connexion</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Accédez à votre espace SatisGest</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/60 text-red-600 dark:text-red-300 rounded-lg flex items-center animate-slide-in">
            <AlertCircle size={20} className="mr-2 animate-pulse" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
              Adresse email
            </label>
            <div className="relative group">
              <input
                id="email"
                type="email"
                className="w-full px-4 py-3 pl-10 border border-gray-200 dark:border-gray-600 rounded-lg bg-white/80 dark:bg-gray-700/80 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemple@domaine.com"
                required
              />
              <Mail size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 transition-transform duration-300 group-hover:scale-110" />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
              Mot de passe
            </label>
            <div className="relative group">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="w-full px-4 py-3 pr-12 border border-gray-200 dark:border-gray-600 rounded-lg bg-white/80 dark:bg-gray-700/80 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-blue-500 transition-transform duration-300 hover:scale-110"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-green-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
            disabled={loading}
          >
            <span className="relative z-10">{loading ? 'Connexion...' : 'Se connecter'}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-800 to-green-800 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-300">
          Pas de compte ?{' '}
          <Link to="/inscription" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-all duration-300 hover:underline">
            Inscrivez-vous
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Connexion;