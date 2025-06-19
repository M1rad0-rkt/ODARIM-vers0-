import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createRequest } from '../../api/requests';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const categories = [
  'Technique',
  'Commercial',
  'Facturation',
  'Service après-vente',
  'Autre',
];

const NouvelleDemande = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Autre');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title || !description || !category) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    try {
      setLoading(true);
      const requestData = { title, description, category };
      const newRequest = await createRequest(requestData);
      console.log('New Request:', newRequest);
      setSuccess('Demande créée avec succès');

      setTitle('');
      setDescription('');
      setCategory('Autre');

      setTimeout(() => {
        navigate('/client/demandes');
      }, 2000);
    } catch (err) {
      console.error('Erreur lors de la création de la demande:', err);
      setError('Impossible de créer la demande');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-6 relative overflow-hidden animate-fade-in">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gradient-to-br from-blue-400/20 to-purple-400/20 dark:from-blue-800/20 dark:to-purple-800/20 blur-3xl rounded-full animate-float"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gradient-to-br from-purple-400/20 to-pink-400/20 dark:from-purple-800/20 dark:to-pink-800/20 blur-3xl rounded-full animate-float-delayed"></div>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 animate-gradient-text">
          Nouvelle Demande
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 animate-slide-in">
          Créez une nouvelle demande d'assistance
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 animate-slide-in">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-green-600 to-teal-600 dark:from-green-700 dark:to-teal-700 p-4 rounded-t-2xl">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100/80 dark:bg-green-900/60 text-green-800 dark:text-green-200 text-sm font-medium animate-pulse-slow">
              <CheckCircle2 size={16} className="mr-2" />
              Formulaire de demande
            </div>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-100/90 dark:bg-red-900/90 text-red-600 dark:text-red-300 border border-red-200/50 dark:border-red-700/50 flex items-start animate-slide-in">
                <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0 animate-pulse" />
                <span className="text-sm">{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-6 p-4 rounded-xl bg-green-100/90 dark:bg-green-900/90 text-green-700 dark:text-green-300 border border-green-200/50 dark:border-green-700/50 flex items-start animate-slide-in">
                <CheckCircle2 size={18} className="mr-2 mt-0.5 flex-shrink-0 animate-pulse" />
                <span className="text-sm">{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative group">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
                  Titre
                </label>
                <input
                  id="title"
                  type="text"
                  className="w-full px-4 py-2 bg-white/60 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-full text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-500 text-sm group-hover:shadow-md focus:shadow-lg placeholder:font-light"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Résumez votre demande"
                  required
                />
              </div>

              <div className="relative group">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
                  Catégorie
                </label>
                <select
                  id="category"
                  className="w-full px-4 py-2 bg-white/60 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-full text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-all duration-300 appearance-none text-sm group-hover:shadow-md focus:shadow-lg cursor-pointer"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none top-1/2 transform -translate-y-1/2">
                  <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div className="relative group">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1.5">
                  Description
                </label>
                <textarea
                  id="description"
                  className="w-full px-4 py-2 bg-white/60 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-all duration-300 h-32 placeholder-gray-400 dark:placeholder-gray-500 text-sm group-hover:shadow-md focus:shadow-lg placeholder:font-light"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez votre demande..."
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 rounded-md bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium hover:from-gray-300 hover:to-gray-400 dark:hover:from-gray-600 dark:hover:to-gray-500 transition-all duration-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => navigate('/client/demandes')}
                  disabled={loading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 rounded-md bg-gradient-to-r from-green-500 to-teal-500 dark:from-green-600 dark:to-teal-600 text-white text-sm font-medium hover:from-green-600 hover:to-teal-600 dark:hover:from-green-700 dark:hover:to-teal-700 transition-all duration-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? 'Création...' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NouvelleDemande;